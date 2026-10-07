import { memo } from 'react'
import type { ChangeEvent } from 'react'
import { useViewport } from '../lib/viewport'
import { t } from '../lib/locale'
import { useSearchPrefs } from '../store/useSearchPrefs'
import type { SearchFilter } from '../../preload'
import {
  activeFilterChips,
  BIT_DEPTHS,
  CHANNEL_OPTIONS,
  FILE_TYPES,
  LICENSE_OPTIONS,
  SAMPLE_RATES,
  SORT_OPTIONS,
} from '../lib/filterLabels'
import { FilterPopover } from './FilterPopover'
import { DurationRange, Field, StyledSelect } from './filterFields'

const numOrUndef = (v: string): number | undefined =>
  v === '' ? undefined : Number(v)

export const FilterBar = memo(function FilterBar() {
  const { isRail } = useViewport()
  const sort = useSearchPrefs((s) => s.sort)
  const filter = useSearchPrefs((s) => s.filter)
  const setSort = useSearchPrefs((s) => s.setSort)
  const setFilter = useSearchPrefs((s) => s.setFilter)
  const removeFilter = useSearchPrefs((s) => s.removeFilter)
  const clearFilter = useSearchPrefs((s) => s.clearFilter)

  const chips = activeFilterChips(filter)

  const onNum =
    (key: 'durationMin' | 'durationMax' | 'bpmMin' | 'bpmMax' | 'sampleRate' | 'bitDepth' | 'channels') =>
    (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      setFilter({ [key]: numOrUndef(e.target.value) } as Partial<SearchFilter>)

  const sortSelect = (
    <StyledSelect
      aria-label={t('Sort results', '検索結果の並び順')}
      value={sort}
      onChange={(e) => setSort(e.target.value as typeof sort)}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </StyledSelect>
  )

  const filterFields = (
    <>
          <Field label={t('Duration', '長さ')} wide>
            <DurationRange
              min={filter.durationMin}
              max={filter.durationMax}
              onMin={onNum('durationMin')}
              onMax={onNum('durationMax')}
            />
          </Field>
          <Field label="BPM" wide>
            <div className="flex items-center gap-1">
              <input type="number" min="1" max="400" aria-label={t('Minimum BPM', '最小BPM')}
                value={filter.bpmMin ?? ''} onChange={onNum('bpmMin')}
                className="w-full min-w-0 rounded border border-line bg-surface px-1.5 py-1 text-ink" />
              <span>–</span>
              <input type="number" min="1" max="400" aria-label={t('Maximum BPM', '最大BPM')}
                value={filter.bpmMax ?? ''} onChange={onNum('bpmMax')}
                className="w-full min-w-0 rounded border border-line bg-surface px-1.5 py-1 text-ink" />
            </div>
          </Field>
          <Field label={t('Key', 'キー')} wide>
            <div className="flex gap-1">
              <StyledSelect aria-label={t('Key', 'キー')} value={filter.tonalityKey ?? ''}
                onChange={(e) => setFilter({ tonalityKey: e.target.value || undefined })}>
                <option value="">{t('Any key', 'すべてのキー')}</option>
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((key) =>
                  <option key={key} value={key}>{key}</option>)}
              </StyledSelect>
              <StyledSelect aria-label={t('Mode', '調性')} value={filter.tonalityMode ?? 'major'}
                onChange={(e) => setFilter({ tonalityMode: e.target.value as 'major' | 'minor' })}>
                <option value="major">{t('Major', 'メジャー')}</option>
                <option value="minor">{t('Minor', 'マイナー')}</option>
              </StyledSelect>
            </div>
          </Field>

          <Field label={t('Sample rate', 'サンプルレート')}>
            <StyledSelect
              aria-label={t('Sample rate', 'サンプルレート')}
              value={filter.sampleRate ?? ''}
              onChange={onNum('sampleRate')}
            >
              <option value="">{t('Any', 'すべて')}</option>
              {SAMPLE_RATES.map((r) => (
                <option key={r} value={r}>
                  {r / 1000} kHz
                </option>
              ))}
            </StyledSelect>
          </Field>

          <Field label={t('Bit depth', 'ビット深度')}>
            <StyledSelect
              aria-label={t('Bit depth', 'ビット深度')}
              value={filter.bitDepth ?? ''}
              onChange={onNum('bitDepth')}
            >
              <option value="">{t('Any', 'すべて')}</option>
              {BIT_DEPTHS.map((b) => (
                <option key={b} value={b}>
                  {b}-bit
                </option>
              ))}
            </StyledSelect>
          </Field>

          <Field label={t('Channels', 'チャンネル')}>
            <StyledSelect
              aria-label={t('Channels', 'チャンネル')}
              value={filter.channels ?? ''}
              onChange={onNum('channels')}
            >
              <option value="">{t('Any', 'すべて')}</option>
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </StyledSelect>
          </Field>

          <Field label={t('File type', 'ファイル形式')}>
            <StyledSelect
              aria-label={t('File type', 'ファイル形式')}
              value={filter.fileType ?? ''}
              onChange={(e) => setFilter({ fileType: e.target.value || undefined })}
            >
              <option value="">{t('Any', 'すべて')}</option>
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </StyledSelect>
          </Field>

          <Field label={t('License', 'ライセンス')} wide>
            <StyledSelect
              aria-label={t('License', 'ライセンス')}
              value={filter.license ?? ''}
              onChange={(e) =>
                setFilter({
                  license: (e.target.value || undefined) as SearchFilter['license'],
                })
              }
            >
              <option value="">{t('Any license', 'すべてのライセンス')}</option>
              {LICENSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </StyledSelect>
          </Field>
    </>
  )

  return (
    <div className="mt-2 flex flex-col gap-2">
      {isRail ? (
        <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted [&>span>div]:block [&>span>div>button]:w-full [&>span>div>button]:justify-between">
          <span className="min-w-0">{sortSelect}</span>
          <span className="min-w-0">
            <FilterPopover count={chips.length} onClearAll={clearFilter}>
              {filterFields}
            </FilterPopover>
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-muted">
          <label className="flex items-center gap-1.5">
            <span>{t('Sort', '並び順')}</span>
            <span className="w-44">{sortSelect}</span>
          </label>

          <FilterPopover count={chips.length} onClearAll={clearFilter}>
            {filterFields}
          </FilterPopover>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label={t('Active filters', '適用中のフィルター')}>
          {chips.map((c) => (
            <button
              key={c.keys.join(',')}
              type="button"
              onClick={() => c.keys.forEach(removeFilter)}
              className="inline-flex items-center gap-1 rounded border border-accent-2 px-1.5 py-0.5 text-[11px] text-accent-2-text hover:bg-surface-raised"
              title={t('Remove this filter', 'このフィルターを解除')}
            >
              <span>{c.label}</span>
              <span aria-hidden>×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilter}
            className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-line-strong hover:text-ink"
          >
            {t('Clear all', 'すべて解除')}
          </button>
        </div>
      )}
    </div>
  )
})
