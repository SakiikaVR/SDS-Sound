import type { SearchFilter, SearchSort } from '../../preload'
import { t } from './locale'

export const SORT_OPTIONS: ReadonlyArray<{ value: SearchSort; label: string }> = [
  { value: 'relevance', label: t('Relevance', '関連度') },
  { value: 'duration_asc', label: t('Duration (short → long)', '長さ（短い順）') },
  { value: 'duration_desc', label: t('Duration (long → short)', '長さ（長い順）') },
  { value: 'rating', label: t('Rating', '評価') },
  { value: 'downloads', label: t('Downloads', 'ダウンロード数') },
  { value: 'created', label: t('Date created', '作成日') },
]

type License = NonNullable<SearchFilter['license']>

export const LICENSE_OPTIONS: ReadonlyArray<{ value: License; label: string }> = [
  { value: 'commercial', label: t('Usable in commercial work', '商用利用可') },
  { value: 'cc0', label: 'CC0 only' },
  { value: 'cc-by', label: 'CC-BY only' },
  { value: 'cc-by-nc', label: 'CC-BY-NC only' },
  { value: 'sampling-plus', label: 'Sampling+ only' },
]

export const FILE_TYPES: readonly string[] = [
  'wav',
  'aiff',
  'flac',
  'mp3',
  'ogg',
  'm4a',
]

export const SAMPLE_RATES: readonly number[] = [
  22050, 32000, 44100, 48000, 88200, 96000,
]

export const BIT_DEPTHS: readonly number[] = [8, 16, 24, 32]

export const CHANNEL_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: t('Mono', 'モノラル') },
  { value: 2, label: t('Stereo', 'ステレオ') },
]

export interface FilterChip {
  /** The `SearchFilter` keys this chip owns — removing it clears all of them. */
  keys: ReadonlyArray<keyof SearchFilter>
  label: string
}

/** One removable chip per active constraint, in a stable display order. */
export function activeFilterChips(f: SearchFilter): FilterChip[] {
  const chips: FilterChip[] = []

  if (f.durationMin != null || f.durationMax != null) {
    const lo = f.durationMin != null ? `${f.durationMin}s` : '0s'
    const hi = f.durationMax != null ? `${f.durationMax}s` : '∞'
    chips.push({ keys: ['durationMin', 'durationMax'], label: `${t('Duration', '長さ')} ${lo}–${hi}` })
  }
  if (f.bpmMin != null || f.bpmMax != null) {
    chips.push({
      keys: ['bpmMin', 'bpmMax'],
      label: `BPM ${f.bpmMin ?? '…'}–${f.bpmMax ?? '…'}`,
    })
  }
  if (f.tonalityKey) {
    chips.push({
      keys: ['tonalityKey', 'tonalityMode'],
      label: `${f.tonalityKey} ${f.tonalityMode === 'minor' ? t('minor', 'マイナー') : t('major', 'メジャー')}`,
    })
  }
  if (f.sampleRate != null) {
    chips.push({ keys: ['sampleRate'], label: `${f.sampleRate / 1000} kHz` })
  }
  if (f.bitDepth != null) {
    chips.push({ keys: ['bitDepth'], label: `${f.bitDepth}-bit` })
  }
  if (f.channels != null) {
    const label =
      f.channels === 1 ? t('Mono', 'モノラル') : f.channels === 2 ? t('Stereo', 'ステレオ') : t(`${f.channels} channels`, `${f.channels} チャンネル`)
    chips.push({ keys: ['channels'], label })
  }
  if (f.fileType) {
    chips.push({ keys: ['fileType'], label: f.fileType.toUpperCase() })
  }
  if (f.license) {
    const label =
      LICENSE_OPTIONS.find((o) => o.value === f.license)?.label ?? String(f.license)
    chips.push({ keys: ['license'], label })
  }

  return chips
}

/** Whether any constraint at all is active. */
export function hasActiveFilter(f: SearchFilter): boolean {
  return activeFilterChips(f).length > 0
}
