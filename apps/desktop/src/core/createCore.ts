import type { Core, CoreDeps } from './api'
import { readFile, stat } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { nextEditId } from './db/edits'
import { upsertSound } from './db/sounds'
import { saveLibraryEntry } from './db/library'
import { writeOriginal } from './staging/contentStore'
import type { Sound } from './types'
import { classifyError } from './classifyError'
import { createLogger, NULL_LOG_SINK, type Logger } from './logging/logger'
import { mergeUiState } from './uiState'
import { openDb, type DB } from './db/index'
import { assessStartup } from './startup/assessStartup'
import { createRebuildService, type RebuildService } from './rebuild/rebuildService'
import { createEditService, type EditService } from './edits/editService'
import { createPeakService, type PeakService } from './peaks/peakService'
import { createSearchService } from './search/searchService'
import {
  createAuthController,
  createRealScheduler,
  type AuthController,
  type Scheduler,
} from './auth/index'
import { unconfiguredAuth } from './auth/unconfiguredAuth'
import {
  createStagingController,
  type StagingController,
} from './staging/stagingController'
import {
  createDragController,
  type DragController,
} from './staging/dragController'
import { createDragRegistry } from './staging/dragRegistry'
import { sweepDragDir } from './staging/sweepDragDir'
import { DEFAULT_STAGING_BYTE_BUDGET } from './staging/eviction'
import { createLibraryCommands } from './library/libraryCommands'
import { createCollectionCommands } from './collections/collectionCommands'
import {
  readLibraryFilter,
  readSearchPrefs,
  readUiState,
  writeLibraryFilter,
  writeSearchPrefs,
  writeUiState,
} from './prefs'

const DEBOUNCE_MS = 320

/**
 * Assemble the application core and wire its persistence, auth, staging,
 * search, telemetry, and media services to the supplied platform dependencies.
 */
export function createCore(deps: CoreDeps): Core {
  const { gateway, dbPath, dataDir, debounceMs = DEBOUNCE_MS } = deps

  const startupAssessment = assessStartup({ dbPath, dataDir })
  const db: DB = openDb(dbPath)
  const logger: Logger = createLogger(deps.logSink ?? NULL_LOG_SINK)

  sweepDragDir(dataDir, logger)

  const scheduler: Scheduler = deps.scheduler ?? createRealScheduler()

  const auth: AuthController =
    deps.authPlatform && deps.scheduler
      ? createAuthController({
          gateway,
          platform: deps.authPlatform,
          scheduler: deps.scheduler,
          db,
          clientId: deps.clientId ?? '',
          onStateChange: deps.onAuthStateChange,
        })
      : unconfiguredAuth(deps.onAuthStateChange)

  const dragRegistry = createDragRegistry()

  const peakService: PeakService = createPeakService({
    db,
    dataDir,
    peakWorkerPath: deps.peakWorkerPath,
    runner: deps.computePeaksRunner,
    audioRenderRunner: deps.audioRenderRunner,
    onStatusChange: deps.onPeaksStatusChange,
  })

  const rebuild: RebuildService = createRebuildService({
    db,
    dataDir,
    rebuildWorkerPath: deps.rebuildWorkerPath,
    runner: deps.rebuildRunner,
    onProgress: deps.onRebuildProgress,
  })

  const edits: EditService = createEditService({
    db,
    dataDir,
    runner: deps.audioRenderRunner,
    onEvent: deps.onEditProgress,
  })

  const staging: StagingController = createStagingController({
    db,
    dataDir,
    gateway,
    auth,
    scheduler,
    onStatusChange: (change) => {
      if (change.status === 'failed') {
        logger.warn('staged download failed', { soundId: change.soundId })
      }
      deps.onStagingStatusChange?.(change)
    },
    onDownloadFailed: (_soundId, err) => {
      deps.telemetry?.report({
        code: 'download_failed',
        subReason: classifyError(err).kind,
      })
    },
    onOriginalReady: (soundId) => peakService.requestPeaks(soundId),
    byteBudget: deps.stagingByteBudget ?? DEFAULT_STAGING_BYTE_BUDGET,
    inFlightDrags: dragRegistry,
    concurrency: deps.stagingConcurrency,
    maxRetries: deps.stagingMaxRetries,
    backoffMs: deps.stagingBackoffMs,
  })

  const drag: DragController | undefined = deps.dragHost
    ? createDragController({
        db,
        dataDir,
        dragHost: deps.dragHost,
        fallbackIconPath: deps.dragIconFallbackPath,
        dragRegistry,
      })
    : undefined

  function requireDrag(): DragController {
    if (!drag) {
      throw new Error('Drag-out is not configured (no DragHost was provided).')
    }
    return drag
  }

  const search = createSearchService({
    db,
    gateway,
    auth,
    logger,
    debounceMs,
    telemetry: deps.telemetry,
  })
  const library = createLibraryCommands({ db, dataDir, logger })
  const collections = createCollectionCommands(db)

  return {
    search: (query, opts) => search.search(query, opts),
    searchDebounced: (query, opts) => search.searchDebounced(query, opts),
    getSearchPrefs: () => readSearchPrefs(db),
    setSearchPrefs: (prefs) => writeSearchPrefs(db, prefs),

    getUiState: () => readUiState(db),
    setUiState: (patch) =>
      writeUiState(db, mergeUiState(readUiState(db), patch ?? {})),
    getLogPath: () => logger.path(),
    readLog: (opts) => logger.read(opts?.maxLines ?? 500),
    log: (level, message, meta) => logger[level]?.(message, meta),
    reportError: (event) => deps.telemetry?.report(event),

    signIn: () => auth.signIn(),
    signOut: () => auth.signOut(),
    getAuthState: () => auth.getState(),
    subscribeAuthState: (listener) => auth.subscribe(listener),

    stageOnAudition: (soundId) => staging.stageOnAudition(soundId),
    downloadToLibrary: (soundId, sound) =>
      staging.downloadToLibrary(soundId, sound),
    getDownloadsInLast24h: () => staging.getDownloadsInLast24h(),
    cancelStaging: (soundId) => staging.cancelStaging(soundId),
    getStagingStatus: (ids) => staging.getStagingStatus(ids),
    getStagingConsent: () => staging.getStagingConsent(),
    grantStagingConsent: () => staging.grantStagingConsent(),
    subscribeStagingStatus: (listener) => staging.subscribe(listener),

    startDrag: (soundIds, opts) => requireDrag().startDrag(soundIds, opts),
    getDragCapabilities: () => ({
      multiSound: drag?.multiSoundDragSupported ?? false,
    }),
    endDrag: (soundIds) =>
      dragRegistry.end(typeof soundIds === 'number' ? [soundIds] : soundIds),
    getDiskUsage: () => staging.getDiskUsage(),
    clearStaged: () => staging.clearStaged(),

    ...library,
    async importLocalFile(filePath) {
      const ext = extname(filePath).slice(1).toLowerCase()
      if (!['wav', 'aiff', 'aif', 'flac', 'mp3', 'ogg', 'm4a'].includes(ext)) {
        throw new Error('Unsupported audio file format')
      }
      const info = await stat(filePath)
      if (!info.isFile() || info.size === 0 || info.size > 256_000_000) {
        throw new Error('Audio file is empty or too large')
      }
      const bytes = await readFile(filePath)
      const soundId = nextEditId(db)
      const sound: Sound = {
        id: soundId,
        name: basename(filePath),
        username: 'Local',
        license: { url: '', name: 'Local' },
        duration: 0,
        tags: [],
        filesize: bytes.byteLength,
        type: ext,
        samplerate: 0,
        channels: 0,
        bitdepth: 0,
        previewUrls: { hqMp3: '', lqMp3: '', hqOgg: '', lqOgg: '' },
        waveformUrls: { m: '', l: '' },
        url: '',
        downloadCount: 0,
        avgRating: 0,
        created: new Date(info.birthtimeMs || info.mtimeMs).toISOString(),
      }
      const written = await writeOriginal(dataDir, sound, bytes, Date.now())
      db.transaction(() => {
        upsertSound(db, sound)
        db.prepare('UPDATE sounds SET local_path = ? WHERE id = ?').run(written.paths.original, soundId)
        saveLibraryEntry(db, soundId, Date.now())
      })()
      peakService.requestPeaks(soundId)
      return { soundId }
    },
    getLibraryFilter: () => readLibraryFilter(db),
    setLibraryFilter: (filter) => writeLibraryFilter(db, filter),

    ...collections,

    getPeaks: (soundId) => peakService.getPeaks(soundId),
    requestPeaks: (soundId) => peakService.requestPeaks(soundId),
    subscribePeaksStatus: (listener) => peakService.subscribe(listener),

    getStartupAssessment: () => startupAssessment,
    rebuildFromSidecars: () => rebuild.rebuildFromSidecars(),
    subscribeRebuildProgress: (listener) => rebuild.subscribe(listener),

    createEdit: (parentSoundId, spec) => edits.createEdit(parentSoundId, spec),
    cancelEdit: (parentSoundId) => edits.cancelEdit(parentSoundId),
    subscribeEditProgress: (listener) => edits.subscribe(listener),

    close: () => {
      search.close()
      staging.close()
      peakService.close()
      rebuild.close()
      edits.close()
      auth.close()
      dragRegistry.clear()
      db.close()
    },
  }
}
