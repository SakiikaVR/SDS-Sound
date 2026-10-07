import { AddToCollectionBar } from '../components/AddToCollectionBar'
import { ResultList } from '../components/ResultList'
import type { UseLibraryView } from '../hooks/useLibraryView'
import { useViewport } from '../lib/viewport'
import { t } from '../lib/locale'
import { useLibraryFilter } from '../store/useLibraryFilter'
import { useLibrary } from '../store/useLibrary'
import { useState } from 'react'
import type { Sound } from '../../core/types'

export interface LibraryViewProps {
  library: UseLibraryView
  filtered: boolean
  resultCountText: string | null
  onFocusSearch: () => void
  onRemove: (sound: Sound) => void
  onEdit: (sound: Sound) => void
}

function EmptyLibrary({ filtered }: { filtered: boolean }) {
  if (filtered) {
    return (
      <div className="p-4 text-sm text-ink-muted">
        <p className="font-medium text-ink-muted">
          {t('No Library sounds match this filter.', 'このフィルターに一致するライブラリの音はありません。')}
        </p>
        <button
          type="button"
          onClick={() => useLibraryFilter.getState().clearFilter()}
          className="mt-2 rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-line-strong hover:text-ink"
        >
          {t('Clear all filters', 'すべてのフィルターを解除')}
        </button>
      </div>
    )
  }
  return (
    <div className="p-4 text-sm text-ink-muted">
      <p className="font-medium text-ink-muted">{t('Your Library is empty.', 'ライブラリは空です。')}</p>
      <p className="mt-1">
        {t('Search for a sound, then press ', '音を検索して、')}
        <kbd className="rounded border border-line px-1">s</kbd>{t(' or its ', ' キー、または ')}
        <span className="font-medium">{t('Download', 'ダウンロード')}</span>{t(' button to fetch the Original and keep it here.', ' ボタンでオリジナル音声を保存できます。')}
      </p>
    </div>
  )
}

export function LibraryView({
  library,
  filtered,
  resultCountText,
  onFocusSearch,
  onRemove,
  onEdit,
}: LibraryViewProps) {
  const { isRail } = useViewport()
  const noteCreated = useLibrary((s) => s.noteCreated)
  const [importError, setImportError] = useState<string | null>(null)

  const importFiles = async () => {
    setImportError(null)
    try {
      const ids = await window.core.importLocalFiles()
      ids.forEach(noteCreated)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end border-b border-line px-4 py-2">
        <button type="button" onClick={() => void importFiles()} className="rounded border border-line px-2 py-1 text-xs text-ink hover:border-line-strong">
          {t('Import audio files', '音声ファイルを取り込む')}
        </button>
      </div>
      {importError && <p className="px-4 py-2 text-sm text-error" role="alert">{t('Import failed:', '取り込みに失敗しました:')} {importError}</p>}
      <AddToCollectionBar />

      {library.status === 'error' && (
        <p className="p-4 text-sm text-error" role="alert">
          {t('Could not read the Library.', 'ライブラリを読み込めませんでした。')}
        </p>
      )}

      {library.status === 'ok' && library.sounds.length === 0 && (
        <EmptyLibrary filtered={filtered} />
      )}

      {library.sounds.length > 0 && (
        <div className="min-h-0 flex-1">
          <ResultList
            sounds={library.sounds}
            hasMore={false}
            loadingMore={false}
            loadMore={() => {}}
            onFocusSearch={onFocusSearch}
            variant="library"
            onRemove={onRemove}
            onEdit={onEdit}
            topSlot={isRail ? resultCountText : undefined}
          />
        </div>
      )}
    </div>
  )
}
