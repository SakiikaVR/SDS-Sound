import { formatDuration } from '../../lib/format'
import { t } from '../../lib/locale'
import { LicenseChip } from '../LicenseChip'
import { StagingChip } from '../StagingChip'
import { Waveform } from '../Waveform'
import { RowMenu, RowName, RowPlayButton, RowTags } from './RowParts'
import type { RowModel } from './types'

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

/**
 * The search row's download affordance, which doubles as its state readout:
 * downloading → retry → "in your Library" (arming a delete on hover) → download.
 */
function DownloadControl({ row }: { row: RowModel }) {
  const {
    stagingStatus,
    inLibrary,
    armDelete,
    setArmDelete,
    onDownload,
    onDeleteFromLibrary,
  } = row

  if (stagingStatus === 'queued' || stagingStatus === 'downloading') {
    return (
      <span
        className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint"
        title={t("Downloading this sound's Original from Freesound", 'Freesoundからオリジナル音声をダウンロード中')}
      >
        {t('Downloading…', 'ダウンロード中…')}
      </span>
    )
  }

  if (stagingStatus === 'failed' && !inLibrary) {
    return (
      <button
        type="button"
        onMouseDown={stop}
        onClick={onDownload}
        className="shrink-0 rounded border border-error px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-error hover:bg-surface-raised"
        title={t('The download failed — try again', 'ダウンロードに失敗しました。再試行してください。')}
      >
        {t('↻ Retry download', '↻ 再試行')}
      </button>
    )
  }

  if (inLibrary) {
    return (
      <button
        type="button"
        onMouseDown={stop}
        onMouseEnter={() => setArmDelete(true)}
        onMouseLeave={() => setArmDelete(false)}
        onClick={onDeleteFromLibrary}
        className={[
          'w-[104px] shrink-0 rounded border px-1.5 py-0.5 text-center text-[10px] font-medium uppercase tracking-wide',
          armDelete
            ? 'border-error text-error hover:bg-surface-raised'
            : 'border-ok text-ok',
        ].join(' ')}
        title={t('In your Library — click to remove it and delete the downloaded Original', 'ライブラリにあります。クリックするとオリジナル音声も削除します。')}
      >
        {armDelete ? t('Delete?', '削除？') : t('✓ Downloaded', '✓ 保存済み')}
      </button>
    )
  }

  return (
    <button
      type="button"
      onMouseDown={stop}
      onClick={onDownload}
      className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted hover:border-line-strong hover:text-ink"
      title={t("Download this sound's Original from Freesound and save it to your Library", 'Freesoundのオリジナル音声をライブラリに保存')}
    >
      {t('⬇ Download', '⬇ ダウンロード')}
    </button>
  )
}

/** The full-width layout: one line, with the row's actions as visible controls. */
export function ResultRowWide({ row }: { row: RowModel }) {
  const {
    props,
    variant,
    isLibraryVariant,
    customName,
    isEdit,
    displayName,
    checked,
    toggleChecked,
    showCollections,
    memberOf,
    stagingStatus,
    previewFailed,
  } = row
  const { sound, onEdit, onRemove, removeLabel, removeTitle } = props

  return (
    <>
      {isLibraryVariant && (
        <input
          type="checkbox"
          checked={checked}
          onMouseDown={stop}
          onChange={toggleChecked}
          aria-label={t(`Select ${displayName} for batch actions`, `${displayName} を選択`)}
          className="h-3.5 w-3.5 shrink-0 accent-[var(--sd-accent-2)]"
        />
      )}

      <RowPlayButton row={row} size="md" />

      <Waveform
        soundId={sound.id}
        url={sound.waveformUrls.m}
        active={row.isCurrent}
        className="h-9 w-28 shrink-0 rounded-sm"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <RowName row={row} className="truncate text-sm font-medium text-ink" />
          {isLibraryVariant && customName && !isEdit && (
            <span
              className="shrink-0 truncate text-[11px] italic text-ink-faint"
              title={`Freesound name: ${sound.name}`}
            >
              aka {sound.name}
            </span>
          )}
          <span className="shrink-0 text-xs text-ink-faint">
            {sound.username}
          </span>
        </div>

        <div
          className="mt-0.5 flex items-center gap-2 overflow-hidden"
          title={
            sound.tags.length > 0
              ? `Freesound tags: ${sound.tags.join(', ')}`
              : undefined
          }
        >
          <span className="shrink-0 text-xs tabular-nums text-ink-muted">
            {formatDuration(sound.duration)}
          </span>
          {sound.bpm != null && <span className="shrink-0 text-[11px] text-ink-muted" title={t('Estimated BPM', '推定BPM')}>{Math.round(sound.bpm)} BPM</span>}
          {sound.tonality && <span className="shrink-0 text-[11px] text-ink-muted" title={t('Estimated key', '推定キー')}>{sound.tonality}</span>}
          <span
            className="shrink-0 rounded border border-line px-1 text-[10px] font-medium uppercase tracking-wide text-ink-faint"
            title={`File format: ${sound.type.toUpperCase()}`}
          >
            {sound.type}
          </span>
          {previewFailed && (
            <span
              className="shrink-0 rounded border border-error px-1 text-[10px] font-medium uppercase tracking-wide text-error"
              title={t('This Preview failed to load — try again or pick another sound', 'プレビューを読み込めません。再試行するか別の音を選んでください。')}
            >
              {t('preview failed', 'プレビュー失敗')}
            </span>
          )}
          {isLibraryVariant && <StagingChip status={stagingStatus} />}
          {variant === 'search' && <DownloadControl row={row} />}
          {showCollections &&
            memberOf.map((c) => (
              <span
                key={`col:${c.id}`}
                className="shrink-0 truncate rounded border border-accent-2 px-1 text-[10px] text-accent-2-text"
                title={`In the collection “${c.name}”`}
              >
                {c.name}
              </span>
            ))}
          {isLibraryVariant && <RowTags row={row} inputWidth="w-28" />}
        </div>
      </div>

      {isLibraryVariant && onEdit && (
        <button
          type="button"
          onMouseDown={stop}
          onClick={() => onEdit(sound)}
          disabled={stagingStatus !== 'ready'}
          className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-line-strong hover:text-ink disabled:opacity-40"
          title={
            stagingStatus === 'ready'
              ? t('Open the Edit view — trim a region and audition the cut', '編集画面で範囲を切り出して試聴')
              : t("This sound's Original is not on disk yet — it can't be edited", 'オリジナル音声がまだ保存されていないため編集できません。')
          }
        >
          {t('✂ Edit', '✂ 編集')}
        </button>
      )}

      {variant === 'collection' && (
        <button
          type="button"
          onMouseDown={stop}
          onClick={() => onRemove?.(sound)}
          className="shrink-0 rounded border border-error px-1.5 py-0.5 text-[11px] text-error hover:bg-surface-raised"
          title={
            removeTitle ??
            t('Remove from this collection — the sound stays in your Library', 'コレクションから削除します。音はライブラリに残ります。')
          }
        >
          {removeLabel ?? t('Remove from collection', 'コレクションから削除')}
        </button>
      )}

      <RowMenu row={row} />

      {/* Fixed-width licence slot: always rendered, so rows stay aligned. */}
      <div className="flex w-32 shrink-0 items-center">
        {sound.license.name.includes('NC') ? (
          <span
            role="alert"
            className="block w-full whitespace-nowrap rounded border-2 border-license-caution bg-surface-raised px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-license-caution"
            title={t('Non-commercial license — this Sound may not be used in paid work', '非商用ライセンス。この音は有料の作品で使用できない場合があります。')}
          >
            {t('⚠ Non-commercial', '⚠ 非商用')}
          </span>
        ) : (
          <LicenseChip name={sound.license.name} className="w-full" />
        )}
      </div>
    </>
  )
}
