import { renameSync } from 'node:fs'
import { release } from 'node:os'
import { join } from 'node:path'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import {
  assessStartup,
  createCore,
  createFileLogSink,
  createRealScheduler,
  type AuthState,
  type EditEvent,
  type PeaksStatusChange,
  type RebuildProgress,
  type StagingStatusChange,
} from '../core'
import { HttpFreesoundGateway } from '../core/gateway/http'
import { CHANNELS } from '../shared/channels'
import { createElectronAuthPlatform } from './authPlatform'
import { createElectronDragHost } from './dragHost'
import { createErrorTelemetry } from './errorTelemetry'
import { createFfmpegAudioRenderRunner } from './ffmpegRunner'
import { broadcaster } from './broadcast'
import { loadOAuthCredentials, saveOAuthCredentials } from './credentialStore'
import { registerIpc } from './ipc'
import { resolveDragIconPath, resolveFfmpegPath } from './paths'
import { registerWillQuitHandler } from './quit'
import { createWindow } from './window'
import { installApplicationMenu, syncApplicationMenuFromWindow } from './applicationMenu'

void app.whenReady().then(() => {
  installApplicationMenu(app.getLocale().toLowerCase().startsWith('ja') ? 'ja' : 'en')
  const dataDir = app.getPath('userData')
  const credentials = loadOAuthCredentials(dataDir)
  const dbPath = join(dataDir, 'library.db')

  const startup = assessStartup({ dbPath, dataDir })
  if (!startup.db.ok && startup.db.reason === 'unreadable') {
    try {
      renameSync(dbPath, `${dbPath}.corrupt-${Date.now()}`)
    } catch {
      // If we cannot move it, `openDb` will throw and Electron will surface it —
      // still better than silently continuing on a corrupt file.
    }
  }

  const dragIconFallbackPath = resolveDragIconPath()
  const ffmpegPath = resolveFfmpegPath()

  const errorTelemetry = createErrorTelemetry({
    reportUrl: '',
    enabled: false,
    context: {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      osRelease: release(),
    },
  })

  const core = createCore({
    gateway: new HttpFreesoundGateway({
      clientId: credentials?.clientId,
      clientSecret: credentials?.clientSecret,
    }),
    dataDir,
    dbPath,
    logSink: createFileLogSink(join(dataDir, 'logs')),
    telemetry: errorTelemetry,
    authPlatform: createElectronAuthPlatform(),
    scheduler: createRealScheduler(),
    clientId: credentials?.clientId ?? '',
    onAuthStateChange: broadcaster<AuthState>(CHANNELS.authState),
    onStagingStatusChange: broadcaster<StagingStatusChange>(
      CHANNELS.stagingStatus,
    ),
    onPeaksStatusChange: broadcaster<PeaksStatusChange>(CHANNELS.peaksStatus),
    onRebuildProgress: broadcaster<RebuildProgress>(CHANNELS.rebuildProgress),
    onEditProgress: broadcaster<EditEvent>(CHANNELS.editProgress),
    peakWorkerPath: join(__dirname, 'peakWorker.js'),
    rebuildWorkerPath: join(__dirname, 'rebuildWorker.js'),
    dragHost: createElectronDragHost({
      getWindow: () => BrowserWindow.getAllWindows()[0] ?? null,
      fallbackIconPath: dragIconFallbackPath,
    }),
    dragIconFallbackPath,
    audioRenderRunner: ffmpegPath
      ? createFfmpegAudioRenderRunner(ffmpegPath)
      : undefined,
  })

  registerIpc(core)
  ipcMain.handle('credentials:status', () => ({
    configured: credentials !== null,
    clientId: credentials?.clientId ?? '',
  }))
  ipcMain.handle('credentials:save', async (_event, clientId: string, clientSecret: string) => {
    saveOAuthCredentials(dataDir, clientId, clientSecret)
    await core.signOut()
    app.relaunch()
    app.quit()
  })
  ipcMain.handle('credentials:openRegistration', () => shell.openExternal('https://freesound.org/apiv2/apply/'))

  app.on('browser-window-created', (_e, win) => {
    win.webContents.on('did-finish-load', () => {
      void syncApplicationMenuFromWindow(win)
      win.webContents.send(CHANNELS.authState, core.getAuthState())
      if (startup.offerRebuild) {
        win.webContents.send(CHANNELS.rebuildOffer, {
          reason: startup.db.ok ? null : startup.db.reason,
          sidecarCount: startup.sidecarCount,
          notRecoverable: startup.notRecoverable,
        })
      }
    })
  })

  createWindow(core)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(core)
  })

  registerWillQuitHandler(app, errorTelemetry, core)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
