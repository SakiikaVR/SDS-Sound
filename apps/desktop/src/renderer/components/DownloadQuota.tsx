import { useEffect } from 'react'
import {
  DOWNLOAD_QUOTA_LIMIT,
  remainingDownloads,
  useDownloadQuota,
} from '../store/useDownloadQuota'
import { t } from '../lib/locale'

/** Re-count every 60 s so old downloads age out of the 24 h window on their own. */
const REFRESH_MS = 60_000

export function DownloadQuota() {
  const used = useDownloadQuota((s) => s.used)
  const refresh = useDownloadQuota((s) => s.refresh)

  useEffect(() => {
    void refresh()
    const t = setInterval(() => void refresh(), REFRESH_MS)
    return () => clearInterval(t)
  }, [refresh])

  const remaining = remainingDownloads(used)
  if (remaining == null) return null

  const exhausted = remaining === 0
  const low = remaining <= 100

  const tone = exhausted
    ? 'border-error bg-surface-raised text-error'
    : low
      ? 'border-warn bg-surface-raised text-warn'
      : 'border-line text-ink-muted'

  const full = exhausted
    ? t('Download limit reached', 'ダウンロード上限に到達')
    : t(`${remaining.toLocaleString()} download${remaining === 1 ? '' : 's'} left`, `残り ${remaining.toLocaleString()} 件`)
  const abbreviated = `${remaining.toLocaleString()} ↓`
  const sentence = t(`You have downloaded ${used ?? 0} of ${DOWNLOAD_QUOTA_LIMIT} Originals allowed by Freesound in the last 24 hours. The count rolls off as those downloads pass 24 hours old.`, `過去24時間に ${used ?? 0} / ${DOWNLOAD_QUOTA_LIMIT} 件のオリジナル音声をダウンロードしました。24時間経過した分は集計から外れます。`)

  return (
    <span
      className={[
        'shrink-0 rounded border px-2 py-1 text-xs font-semibold tabular-nums',
        tone,
      ].join(' ')}
      title={sentence}
      aria-label={full}
      aria-live="polite"
    >
      <span aria-hidden className="max-[900px]:hidden">
        {full}
      </span>
      <span aria-hidden className="hidden max-[900px]:inline">
        {abbreviated}
      </span>
    </span>
  )
}
