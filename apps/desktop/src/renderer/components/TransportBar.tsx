import { useEffect, useState } from 'react'
import type { Sound } from '../../core/types'
import { formatDuration } from '../lib/format'
import { useViewport } from '../lib/viewport'
import { getPlaybackPosition } from '../store/audioController'
import { useTransport } from '../store/useTransport'
import { RailTransportMenu } from './RailTransportMenu'
import { t } from '../lib/locale'

function TransportSeekBar({ sound }: { sound: Sound }) {
  const [position, setPosition] = useState({ currentTime: 0, duration: sound.duration, ready: false })

  useEffect(() => {
    const sync = () => {
      const playback = getPlaybackPosition(sound.id)
      const next = playback
        ? { ...playback, ready: true }
        : { currentTime: 0, duration: sound.duration, ready: false }
      setPosition((previous) =>
        previous.ready === next.ready &&
        Math.abs(previous.currentTime - next.currentTime) < 0.02 &&
        previous.duration === next.duration
          ? previous
          : next,
      )
    }
    sync()
    const timer = window.setInterval(sync, 100)
    return () => window.clearInterval(timer)
  }, [sound.id, sound.duration])

  const duration = Math.max(0, position.duration)
  const fraction = duration > 0 ? position.currentTime / duration : 0
  const timeLabel = `${formatDuration(Math.floor(position.currentTime))} / ${formatDuration(duration)}`
  const seek = (value: number) => {
    useTransport.getState().seekFraction(value)
    setPosition((previous) => ({ ...previous, currentTime: value * previous.duration }))
  }

  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3 text-xs text-ink-muted">
      <span className="w-24 shrink-0 tabular-nums" aria-live="off">
        {timeLabel}
      </span>
      <input
        type="range"
        min={0}
        max={1000}
        step={1}
        value={Math.round(fraction * 1000)}
        onChange={(event) => seek(Number(event.target.value) / 1000)}
        disabled={!position.ready}
        className="h-1 min-w-0 flex-1 accent-[var(--sd-accent-2)] disabled:opacity-40"
        aria-label={t('Playback position', '再生位置')}
        aria-valuetext={timeLabel}
      />
    </div>
  )
}

function statusLabel(status: string, hasSound: boolean): string {
  if (!hasSound) return t('Nothing playing', '再生中の音なし')
  switch (status) {
    case 'loading':
      return t('Buffering…', '読み込み中…')
    case 'playing':
      return t('Playing', '再生中')
    case 'paused':
      return t('Paused', '一時停止中')
    default:
      return t('Nothing playing', '再生中の音なし')
  }
}

export function TransportBar() {
  const { isRail } = useViewport()
  const status = useTransport((s) => s.status)
  const currentSoundId = useTransport((s) => s.currentSoundId)
  const currentSound = useTransport((s) => s.currentSound)
  const volume = useTransport((s) => s.volume)
  const loop = useTransport((s) => s.loop)
  const autoAdvance = useTransport((s) => s.autoAdvance)
  const setVolume = useTransport((s) => s.setVolume)
  const setLoop = useTransport((s) => s.setLoop)
  const setAutoAdvance = useTransport((s) => s.setAutoAdvance)
  const toggle = useTransport((s) => s.toggle)
  const stop = useTransport((s) => s.stop)

  const hasSound = currentSoundId != null

  return (
    <div className="shrink-0 border-t border-line bg-bg">
      {currentSound && (
        <TransportSeekBar key={currentSound.id} sound={currentSound} />
      )}

      {isRail ? (
        <div className="flex items-center gap-x-3 px-4 py-2 text-xs text-ink-muted">
          <button
            type="button"
            onClick={toggle}
            disabled={!hasSound}
            className={[
              'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] enabled:hover:border-line-strong disabled:opacity-40',
              status === 'loading'
                ? 'animate-pulse border-accent-2 text-accent-2-text'
                : status === 'playing'
                  ? 'border-accent-2 text-accent-2-text'
                  : 'border-line',
            ].join(' ')}
            aria-label={status === 'playing' ? t('Pause', '一時停止') : t('Play', '再生')}
            title={statusLabel(status, hasSound)}
          >
            {status === 'playing' ? '❚❚' : '▶'}
          </button>

          <span
            className="min-w-0 flex-1 truncate"
            title={currentSound?.name ?? statusLabel(status, hasSound)}
          >
            {currentSound?.name ?? statusLabel(status, hasSound)}
          </span>

          <RailTransportMenu
            hasSound={hasSound}
            stop={stop}
            loop={loop}
            setLoop={setLoop}
            autoAdvance={autoAdvance}
            setAutoAdvance={setAutoAdvance}
            volume={volume}
            setVolume={setVolume}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs text-ink-muted">
          <button
            type="button"
            onClick={toggle}
            disabled={!hasSound}
            className="grid h-7 w-7 place-items-center rounded-full border border-line text-[11px] enabled:hover:border-line-strong disabled:opacity-40"
            aria-label={status === 'playing' ? t('Pause', '一時停止') : t('Play', '再生')}
          >
            {status === 'playing' ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={!hasSound}
            className="rounded border border-line px-2 py-1 enabled:hover:border-line-strong disabled:opacity-40"
          >
            {t('Stop', '停止')}
          </button>

          <span className="w-28 shrink-0 tabular-nums text-ink-faint">
            {statusLabel(status, hasSound)}
          </span>

          <label className="flex items-center gap-2">
            <span className="text-ink-faint">{t('Vol', '音量')}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-28 accent-[var(--sd-accent-2)]"
              aria-label={t('Audition volume', '試聴音量')}
            />
            <span className="w-8 tabular-nums text-ink-faint">
              {Math.round(volume * 100)}
            </span>
          </label>

          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
              className="accent-[var(--sd-accent-2)]"
            />
            {t('Loop', 'ループ')}
          </label>

          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="accent-[var(--sd-accent-2)]"
            />
            {t('Auto-advance', '自動で次へ')}
          </label>

        </div>
      )}
    </div>
  )
}
