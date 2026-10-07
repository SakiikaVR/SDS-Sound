import type { KeyboardEvent, RefObject } from 'react'
import { FilterBar } from '../components/FilterBar'
import { LibraryFilterBar } from '../components/LibraryFilterBar'
import { useViewport } from '../lib/viewport'
import { t } from '../lib/locale'
import { useMultiSelect } from '../store/useMultiSelect'
import { useResultSelection } from '../store/useResultSelection'
import type { ShellState } from './useShellState'

type SortDir = 'asc' | 'desc'

/** A sort-direction toggle that collapses to an arrow on a narrow window. */
function SortToggle({
  dir,
  onToggle,
  descLabel,
  ascLabel,
}: {
  dir: SortDir
  onToggle: () => void
  descLabel: string
  ascLabel: string
}) {
  const { isRail } = useViewport()
  const label = dir === 'desc' ? descLabel : ascLabel
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded border border-line px-1.5 py-0.5 text-ink-muted hover:border-line-strong hover:text-ink"
      title={label}
      aria-label={t(`Sort direction: ${label.toLowerCase()}`, `並び順: ${label}`)}
    >
      {isRail ? (dir === 'desc' ? '↓' : '↑') : label}
    </button>
  )
}

export interface ContextBarProps {
  shell: ShellState
  authed: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onSearchKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onSearchChange?: () => void
  libraryDir: SortDir
  setLibraryDir: (dir: SortDir) => void
  collectionDir: SortDir
  setCollectionDir: (dir: SortDir) => void
}

/** The header's second row: whatever the active view needs to steer its list. */
export function ContextBar({
  shell,
  authed,
  inputRef,
  onSearchKeyDown,
  onSearchChange,
  libraryDir,
  setLibraryDir,
  collectionDir,
  setCollectionDir,
}: ContextBarProps) {
  if (shell.view === 'search') {
    if (!authed) return null
    return (
      <>
        <input
          ref={inputRef}
          type="search"
          className="w-full rounded border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-focus focus:outline-none"
          placeholder={t('Search sounds…  (press s to download the selected sound · ? for shortcuts)', 'サウンドを検索…（s: 選択した音をダウンロード · ?: ショートカット）')}
          value={shell.query}
          onChange={(e) => { onSearchChange?.(); shell.setQuery(e.target.value) }}
          onKeyDown={onSearchKeyDown}
          autoFocus
        />
        <FilterBar />
      </>
    )
  }

  if (shell.view === 'library') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span>{t('Sorted by date saved', '保存日時順')}</span>
          <SortToggle
            dir={libraryDir}
            onToggle={() => setLibraryDir(libraryDir === 'desc' ? 'asc' : 'desc')}
            descLabel={t('Newest first', '新しい順')}
            ascLabel={t('Oldest first', '古い順')}
          />
        </div>
        <LibraryFilterBar />
      </>
    )
  }

  const { openCollection } = shell
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
      {openCollection ? (
        <>
          <button
            type="button"
            onClick={() => {
              shell.setOpenCollection(null)
              shell.setShowManifest(false)
              useResultSelection.getState().clear()
              useMultiSelect.getState().clear()
            }}
            className="rounded border border-line px-1.5 py-0.5 text-ink-muted hover:border-line-strong hover:text-ink"
          >
            {t('‹ All collections', '‹ すべてのコレクション')}
          </button>
          <span className="font-medium text-ink">{openCollection.name}</span>
          <SortToggle
            dir={collectionDir}
            onToggle={() =>
              setCollectionDir(collectionDir === 'desc' ? 'asc' : 'desc')
            }
            descLabel={t('Newest added first', '追加が新しい順')}
            ascLabel={t('Oldest added first', '追加が古い順')}
          />
          <button
            type="button"
            onClick={() => shell.setShowManifest(true)}
            className="rounded border border-accent-2 px-1.5 py-0.5 text-accent-2-text hover:bg-surface-raised"
            title={t('Generate the attribution credits this collection owes', 'このコレクションに必要なクレジットを作成')}
          >
            {t('Credits', 'クレジット')}
          </button>
        </>
      ) : (
        <span>
          {t('A collection is a named set of Library sounds. Collections do not nest.', 'コレクションはライブラリの音をまとめるものです。入れ子にはできません。')}
        </span>
      )}
    </div>
  )
}
