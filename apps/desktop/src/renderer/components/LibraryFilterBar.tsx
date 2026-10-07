import { memo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { LibraryFilter } from '../../preload'
import { useLibraryFilter, hasLibraryFilter } from '../store/useLibraryFilter'
import { FILE_TYPES, LICENSE_OPTIONS } from '../lib/filterLabels'
import { t } from '../lib/locale'
import { FilterPopover } from './FilterPopover'
import {
  DurationRange,
  Field,
  FILTER_CONTROL_CLASS,
  StyledSelect,
} from './filterFields'

const numOrUndef = (v: string): number | undefined =>
  v === '' ? undefined : Number(v)

/** Count of active constraints — drives the popover badge. */
function filterCount(f: LibraryFilter): number {
  let n = 0
  if ((f.tags?.length ?? 0) > 0) n += f.tags!.length
  if (f.durationMin != null || f.durationMax != null) n += 1
  if (f.bpmMin != null || f.bpmMax != null) n += 1
  if (f.tonalityKey) n += 1
  if (f.fileType) n += 1
  if (f.license) n += 1
  return n
}

export const LibraryFilterBar = memo(function LibraryFilterBar() {
  const filter = useLibraryFilter((s) => s.filter)
  const setFilter = useLibraryFilter((s) => s.setFilter)
  const addTag = useLibraryFilter((s) => s.addTag)
  const removeTag = useLibraryFilter((s) => s.removeTag)
  const removeFilter = useLibraryFilter((s) => s.removeFilter)
  const clearFilter = useLibraryFilter((s) => s.clearFilter)

  const [tagDraft, setTagDraft] = useState('')

  const onNum =
    (key: 'durationMin' | 'durationMax' | 'bpmMin' | 'bpmMax') =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setFilter({
        [key]: numOrUndef(e.target.value),
      } as Partial<LibraryFilter>)

  const commitTag = () => {
    const tag = tagDraft.trim()
    if (!tag) return
    addTag(tag)
    setTagDraft('')
  }

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag()
    }
  }

  const tags = filter.tags ?? []
  const active = hasLibraryFilter(filter)

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-muted">
        <label className="flex items-center gap-1.5">
          <span>{t('Find', '絞り込み')}</span>
          <input
            type="search"
            placeholder={t('name, author, tag…', '名前、作者、タグ…')}
            aria-label={t('Filter the Library by text', 'ライブラリを文字で絞り込み')}
            className={`${FILTER_CONTROL_CLASS} w-56`}
            value={filter.text ?? ''}
            onChange={(e) => setFilter({ text: e.target.value || undefined })}
          />
        </label>

        <FilterPopover count={filterCount(filter)} onClearAll={clearFilter}>
          <Field label={t('Add tag', 'タグを追加')} wide>
            <input
              type="text"
              placeholder={t('type a tag, press Enter', 'タグを入力してEnter')}
              aria-label={t('Add a tag to the Library filter', 'ライブラリのタグフィルターを追加')}
              className={FILTER_CONTROL_CLASS}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={commitTag}
            />
          </Field>

          <Field label={t('Duration', '長さ')} wide>
            <DurationRange
              min={filter.durationMin}
              max={filter.durationMax}
              onMin={onNum('durationMin')}
              onMax={onNum('durationMax')}
            />
          </Field>

          <Field label="BPM" wide>
            <div className="flex items-center gap-1.5">
              <input type="number" min="1" max="400" aria-label={t('Minimum BPM', '最小BPM')}
                className={FILTER_CONTROL_CLASS} value={filter.bpmMin ?? ''} onChange={onNum('bpmMin')} />
              <span>–</span>
              <input type="number" min="1" max="400" aria-label={t('Maximum BPM', '最大BPM')}
                className={FILTER_CONTROL_CLASS} value={filter.bpmMax ?? ''} onChange={onNum('bpmMax')} />
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

          <Field label={t('License', 'ライセンス')}>
            <StyledSelect
              aria-label={t('License', 'ライセンス')}
              value={filter.license ?? ''}
              onChange={(e) =>
                setFilter({
                  license: (e.target.value ||
                    undefined) as LibraryFilter['license'],
                })
              }
            >
              <option value="">{t('Any', 'すべて')}</option>
              {LICENSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </StyledSelect>
          </Field>
        </FilterPopover>
      </div>

      {active && (
        <div
          className="flex flex-wrap items-center gap-1.5"
          aria-label={t('Active Library filters', '適用中のライブラリフィルター')}
        >
          {tags.map((tag) => (
            <button
              key={`tag:${tag}`}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-1 rounded border border-accent-2 px-1.5 py-0.5 text-[11px] text-accent-2-text hover:bg-surface-raised"
              title={t('Remove this tag filter', 'このタグフィルターを解除')}
            >
              <span># {tag}</span>
              <span aria-hidden>×</span>
            </button>
          ))}
          {filter.text && (
            <FilterPill
              label={`“${filter.text}”`}
              onRemove={() => removeFilter('text')}
            />
          )}
          {(filter.durationMin != null || filter.durationMax != null) && (
            <FilterPill
              label={`${t('Duration', '長さ')} ${filter.durationMin ?? 0}s–${
                filter.durationMax != null ? `${filter.durationMax}s` : '∞'
              }`}
              onRemove={() => {
                removeFilter('durationMin')
                removeFilter('durationMax')
              }}
            />
          )}
          {(filter.bpmMin != null || filter.bpmMax != null) && (
            <FilterPill label={`BPM ${filter.bpmMin ?? '…'}–${filter.bpmMax ?? '…'}`}
              onRemove={() => { removeFilter('bpmMin'); removeFilter('bpmMax') }} />
          )}
          {filter.tonalityKey && (
            <FilterPill label={`${filter.tonalityKey} ${filter.tonalityMode === 'minor' ? t('minor', 'マイナー') : t('major', 'メジャー')}`}
              onRemove={() => { removeFilter('tonalityKey'); removeFilter('tonalityMode') }} />
          )}
          {filter.fileType && (
            <FilterPill
              label={filter.fileType.toUpperCase()}
              onRemove={() => removeFilter('fileType')}
            />
          )}
          {filter.license && (
            <FilterPill
              label={
                LICENSE_OPTIONS.find((o) => o.value === filter.license)
                  ?.label ?? String(filter.license)
              }
              onRemove={() => removeFilter('license')}
            />
          )}
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

function FilterPill({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded border border-accent-2 px-1.5 py-0.5 text-[11px] text-accent-2-text hover:bg-surface-raised"
      title={t('Remove this filter', 'このフィルターを解除')}
    >
      <span>{label}</span>
      <span aria-hidden>×</span>
    </button>
  )
}
