import { ResultList } from '../components/ResultList'
import { SignInGate } from '../components/SignInGate'
import type { UseSearch } from '../hooks/useSearch'
import { activeFilterChips } from '../lib/filterLabels'
import { t } from '../lib/locale'
import { useViewport } from '../lib/viewport'
import { useSearchPrefs } from '../store/useSearchPrefs'
import type { SearchFilter, SearchSort, Sound } from '../../core/types'

export interface SearchViewProps {
  authed: boolean
  query: string
  sort: SearchSort
  filter: SearchFilter
  search: UseSearch
  resultCountText: string | null
  onFocusSearch: () => void
  similarTo?: Sound
  onFindSimilar: (sound: Sound) => void
  onClearSimilar: () => void
}

/** "Nothing matched" — with the active filters offered up for removal. */
function EmptyResults({ query, filter }: { query: string; filter: SearchFilter }) {
  const chips = activeFilterChips(filter)
  return (
    <div className="p-4 text-sm text-ink-muted">
      <p className="font-medium text-ink-muted">
        {t(`Nothing matched “${query.trim()}”${chips.length > 0 ? ' with these filters.' : '.'}`, `「${query.trim()}」に一致する結果がありません${chips.length > 0 ? '（現在のフィルター適用時）' : ''}。`)}
      </p>
      {chips.length > 0 ? (
        <>
          <p className="mt-1">
            {t(`Try relaxing ${chips.length === 1 ? 'this filter' : 'one of these filters'}:`, '次のフィルターを緩めてください:')}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                key={c.keys.join(',')}
                type="button"
                onClick={() =>
                  c.keys.forEach((k) => useSearchPrefs.getState().removeFilter(k))
                }
                className="inline-flex items-center gap-1 rounded border border-warn px-1.5 py-0.5 text-[11px] text-warn hover:bg-surface-raised"
                title={t('Remove this filter', 'このフィルターを解除')}
              >
                <span>{c.label}</span>
                <span aria-hidden>×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => useSearchPrefs.getState().clearFilter()}
              className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-line-strong hover:text-ink"
            >
              {t('Clear all filters', 'すべてのフィルターを解除')}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-1">
          {t('Try fewer or more general words, or check the spelling.', '検索語を短くするか、一般的な言葉に変えてください。スペルも確認してください。')}
        </p>
      )}
    </div>
  )
}

function SearchError({ error }: { error: NonNullable<UseSearch['error']> }) {
  return (
    <p className="p-4 text-sm text-error" role="alert">
      {error.kind === 'throttled'
        ? t(`Rate-limited by Freesound${
            error.retryAfter != null
              ? ` — you can retry in about ${error.retryAfter}s`
              : ''
          }.`, `Freesoundの利用制限に達しました${error.retryAfter != null ? `。約${error.retryAfter}秒後に再試行できます` : ''}。`)
        : error.kind === 'network'
          ? t('Search failed: no connection to Freesound.', '検索に失敗しました。Freesoundに接続できません。')
          : t(`Search failed: ${error.message}`, `検索に失敗しました: ${error.message}`)}
    </p>
  )
}

export function SearchView({
  authed,
  query,
  sort,
  filter,
  search,
  resultCountText,
  onFocusSearch,
  similarTo,
  onFindSimilar,
  onClearSimilar,
}: SearchViewProps) {
  const { isRail } = useViewport()
  if (!authed) return <SignInGate />

  const { status, error, sounds, hasMore, loadingMore, loadMore } = search

  return (
    <>
      {similarTo && <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-xs text-ink-muted">
        <span>{t(`Similar to: ${similarTo.name}`, `「${similarTo.name}」に似た音`)}</span>
        <button type="button" onClick={onClearSimilar} className="rounded border border-line px-2 py-0.5">{t('Clear', '解除')}</button>
      </div>}
      {status === 'loading' && (
        <p className="p-4 text-sm text-ink-muted" aria-live="polite">
          {t('Searching…', '検索中…')}
        </p>
      )}

      {status === 'error' && error && <SearchError error={error} />}

      {status === 'ok' && sounds.length === 0 && (
        <EmptyResults query={query} filter={filter} />
      )}

      {status === 'ok' && sounds.length > 0 && (
        <ResultList
          sounds={sounds}
          hasMore={hasMore}
          loadingMore={loadingMore}
          loadMore={loadMore}
          onFocusSearch={onFocusSearch}
          onFindSimilar={onFindSimilar}
          topSlot={isRail ? resultCountText : undefined}
          resetKey={`${query.trim()} ${sort} ${JSON.stringify(filter)}`}
        />
      )}
    </>
  )
}
