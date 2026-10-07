import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { CollectionsPanel } from './components/CollectionsPanel'
import { EditView } from './components/EditView'
import { LogViewerDialog } from './components/LogViewerDialog'
import { ManifestPanel } from './components/ManifestPanel'
import { NotificationHost } from './components/NotificationHost'
import { RebuildBanner } from './components/RebuildBanner'
import { ShortcutsDialog } from './components/ShortcutsDialog'
import { TransportBar } from './components/TransportBar'
import { FreesoundCredentialsDialog } from './components/FreesoundCredentialsDialog'
import { AppHeader } from './shell/AppHeader'
import { ContextBar } from './shell/ContextBar'
import { useRestoreSelection, useShellState } from './shell/useShellState'
import { CollectionView } from './views/CollectionView'
import { LibraryView } from './views/LibraryView'
import { SearchView } from './views/SearchView'
import { useAuth } from './hooks/useAuth'
import { useCollectionView } from './hooks/useCollectionView'
import { useLibraryView } from './hooks/useLibraryView'
import { useSearch } from './hooks/useSearch'
import { useSearchErrorNotice } from './hooks/useSearchErrorNotice'
import { formatResultCount } from './lib/format'
import { t } from './lib/locale'
import { useCollections } from './store/useCollections'
import { useLibrary } from './store/useLibrary'
import { hasLibraryFilter, useLibraryFilter } from './store/useLibraryFilter'
import { useMultiSelect } from './store/useMultiSelect'
import { useResultSelection } from './store/useResultSelection'
import { useSearchPrefs } from './store/useSearchPrefs'
import type { Sound } from '../core/types'

const countLabel = (n: number) => t(`${n} ${n === 1 ? 'sound' : 'sounds'}`, `${n} 件のサウンド`)

export default function App() {
  const shell = useShellState()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [existingClientId, setExistingClientId] = useState('')
  const [similarSound, setSimilarSound] = useState<Sound | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sort = useSearchPrefs((s) => s.sort)
  const filter = useSearchPrefs((s) => s.filter)
  const prefsReady = useSearchPrefs((s) => s.ready)
  const libraryFilter = useLibraryFilter((s) => s.filter)

  useEffect(() => {
    useSearchPrefs.getState().load()
    useLibraryFilter.getState().load()
    void useCollections.getState().load()
  }, [])

  useEffect(() => {
    let alive = true
    void window.core.getCredentialsStatus().then((status) => {
      if (!alive) return
      setExistingClientId(status.clientId)
      if (!status.configured) setShowCredentials(true)
    })
    const open = () => setShowCredentials(true)
    window.addEventListener('sds-open-credentials', open)
    return () => { alive = false; window.removeEventListener('sds-open-credentials', open) }
  }, [])

  const auth = useAuth()
  const authed = auth.state.status === 'signedIn'

  const search = useSearch(
    shell.query,
    sort,
    filter,
    prefsReady && shell.uiReady && authed,
    similarSound?.id,
  )
  const library = useLibraryView(shell.view === 'library', libraryFilter)
  const collection = useCollectionView(
    shell.view === 'collections' && shell.openCollection
      ? shell.openCollection.id
      : null,
  )

  useSearchErrorNotice(search.status, search.error)
  useRestoreSelection(
    shell,
    shell.view === 'search'
      ? search.sounds
      : shell.view === 'library'
        ? library.sounds
        : collection.sounds,
  )

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        !!el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable)
      if (e.key === '?' && !typing) {
        e.preventDefault()
        setShowShortcuts((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const focusSearch = useCallback(() => {
    const el = inputRef.current
    el?.focus()
    el?.select()
  }, [])

  const onSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' && search.sounds.length > 0) {
        e.preventDefault()
        useResultSelection.getState().select(0, search.sounds[0]?.id ?? null)
      }
    },
    [search.sounds],
  )

  const confirmRemoveFromLibrary = useCallback((sound: Sound) => {
    const ok = window.confirm(
      t(`Remove “${sound.name}” from your Library?\n\nThis also deletes the downloaded Original from this device. You can download it again from search later.`,
        `「${sound.name}」をライブラリから削除しますか？\n\n端末に保存したオリジナル音声も削除されます。後で検索から再ダウンロードできます。`),
    )
    if (ok) {
      useMultiSelect.getState().set(sound.id, false)
      void useLibrary.getState().remove(sound.id)
    }
  }, [])

  const removeFromOpenCollection = useCallback(
    (sound: Sound) => {
      const open = shell.openCollection
      if (!open) return
      useMultiSelect.getState().set(sound.id, false)
      void useCollections.getState().removeSound(open.id, sound.id)
    },
    [shell.openCollection],
  )

  const showSearchResults =
    shell.view === 'search' && search.status === 'ok' && search.sounds.length > 0

  const resultCountText =
    shell.view === 'search' && showSearchResults
      ? formatResultCount(search.totalCount)
      : shell.view === 'library' && library.status === 'ok'
        ? countLabel(library.sounds.length)
        : shell.view === 'collections' &&
            shell.openCollection &&
            collection.status === 'ok'
          ? countLabel(collection.sounds.length)
          : null

  return (
    <main className="flex h-screen flex-col bg-bg text-ink">
      <AppHeader
        view={shell.view}
        onSelectView={shell.selectView}
        authed={authed}
        onSignOut={auth.signOut}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onOpenLogs={() => setShowLogs(true)}
        onOpenCredentials={() => setShowCredentials(true)}
        resultCountText={resultCountText}
        contextBar={
          <ContextBar
            shell={shell}
            authed={authed}
            inputRef={inputRef}
            onSearchKeyDown={onSearchKeyDown}
            onSearchChange={() => setSimilarSound(null)}
            libraryDir={library.dir}
            setLibraryDir={library.setDir}
            collectionDir={collection.dir}
            setCollectionDir={collection.setDir}
          />
        }
      />

      <RebuildBanner />

      <section className="relative min-h-0 flex-1">
        {shell.view === 'search' && (
          <SearchView
            authed={authed}
            query={shell.query}
            sort={sort}
            filter={filter}
            search={search}
            resultCountText={resultCountText}
            onFocusSearch={focusSearch}
            similarTo={similarSound ?? undefined}
            onFindSimilar={(sound) => { setSimilarSound(sound); shell.setQuery(''); shell.selectView('search') }}
            onClearSimilar={() => setSimilarSound(null)}
          />
        )}

        {shell.view === 'library' && (
          <LibraryView
            library={library}
            filtered={hasLibraryFilter(libraryFilter)}
            resultCountText={resultCountText}
            onFocusSearch={focusSearch}
            onRemove={confirmRemoveFromLibrary}
            onEdit={shell.openEdit}
          />
        )}

        {shell.view === 'collections' && !shell.openCollection && (
          <div className="h-full overflow-auto">
            <CollectionsPanel onOpen={shell.setOpenCollection} />
          </div>
        )}

        {shell.view === 'collections' && shell.openCollection && (
          <>
            <CollectionView
              openCollection={shell.openCollection}
              collection={collection}
              resultCountText={resultCountText}
              onFocusSearch={focusSearch}
              onRemove={removeFromOpenCollection}
              onEdit={shell.openEdit}
            />
            {shell.showManifest && (
              <ManifestPanel
                collectionId={shell.openCollection.id}
                collectionName={shell.openCollection.name}
                onClose={() => shell.setShowManifest(false)}
              />
            )}
          </>
        )}
      </section>

      <TransportBar />

      <NotificationHost />
      {showShortcuts && (
        <ShortcutsDialog
          onClose={() => setShowShortcuts(false)}
          onOpenLogs={() => {
            setShowShortcuts(false)
            setShowLogs(true)
          }}
        />
      )}
      {showLogs && <LogViewerDialog onClose={() => setShowLogs(false)} />}
      {showCredentials && <FreesoundCredentialsDialog existingClientId={existingClientId} onClose={() => setShowCredentials(false)} />}
      {shell.view === 'edit' && shell.editingSound && (
        <EditView sound={shell.editingSound} onClose={shell.closeEdit} />
      )}
    </main>
  )
}
