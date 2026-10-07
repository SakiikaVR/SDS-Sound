import type { ReactNode } from 'react'
import { AuthBar } from '../components/AuthBar'
import { DownloadQuota } from '../components/DownloadQuota'
import { OverflowMenu } from '../components/OverflowMenu'
import type { OverflowMenuItem } from '../components/OverflowMenu'
import { useViewport } from '../lib/viewport'
import { getLocale, setLocale, t } from '../lib/locale'
import { setTheme, useTheme } from '../lib/theme'
import type { View } from './useShellState'
const iconUrl = new URL('../../../resources/icon.svg', import.meta.url).href

const TABS: ReadonlyArray<[View, string]> = [
  ['search', 'Search'],
  ['library', 'Library'],
  ['collections', 'Collections'],
]

export interface AppHeaderProps {
  view: View
  onSelectView: (v: View) => void
  authed: boolean
  onSignOut: () => void
  onOpenShortcuts: () => void
  onOpenLogs: () => void
  onOpenCredentials: () => void
  /** The live "N results" / "N sounds" readout, or `null` when there is nothing to count. */
  resultCountText: string | null
  /** View-specific second row: the search field, Library sort, Collection breadcrumb. */
  contextBar: ReactNode
}

function Logo() {
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden
      className="h-5 w-auto shrink-0"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
  )
}

export function AppHeader({
  view,
  onSelectView,
  authed,
  onSignOut,
  onOpenShortcuts,
  onOpenLogs,
  onOpenCredentials,
  resultCountText,
  contextBar,
}: AppHeaderProps) {
  const { isRail } = useViewport()
  const theme = useTheme()

  const menuItems: OverflowMenuItem[] = [
    { label: t('Freesound connection settings', 'Freesound 接続設定'), onSelect: onOpenCredentials },
    ...(authed ? [{ label: t('Sign out', 'ログアウト'), onSelect: onSignOut }] : []),
    { label: t('Keyboard shortcuts', 'キーボードショートカット'), onSelect: onOpenShortcuts },
    { label: t('View logs', 'ログを表示'), onSelect: onOpenLogs },
    { label: theme === 'dark' ? t('Light mode', 'ライトモード') : t('Dark mode', 'ダークモード'), onSelect: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { label: getLocale() === 'ja' ? 'Language: English' : '言語: 日本語', onSelect: () => setLocale(getLocale() === 'ja' ? 'en' : 'ja') },
  ]

  const menu = (
    <OverflowMenu
      items={menuItems}
      label={t('More', 'その他')}
      title={t('More', 'その他')}
      className="inline-flex shrink-0 items-center justify-center rounded border border-line px-1.5 py-0.5 text-[13px] leading-none text-ink-muted hover:border-line-strong hover:text-ink"
    />
  )

  const tab = (v: View, label: string, segmented: boolean) => (
    <button
      key={v}
      type="button"
      onClick={() => onSelectView(v)}
      aria-pressed={view === v}
      className={[
        segmented
          ? 'w-full rounded px-2 py-1.5 text-center text-xs font-medium'
          : 'rounded px-2 py-1 text-xs font-medium',
        view === v
          ? 'bg-surface-raised text-ink ring-1 ring-inset ring-focus'
          : 'text-ink-muted hover:text-ink',
      ].join(' ')}
    >
      {label}
    </button>
  )

  return (
    <header className="shrink-0 border-b border-line p-4">
      {isRail ? (
        <>
          <div className="mb-3 flex items-center gap-x-3">
            <Logo />
            <div className="flex min-w-0 flex-1 items-center justify-end gap-x-2">
              {!authed && <AuthBar />}
              <DownloadQuota />
              {menu}
            </div>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded border border-line p-0.5">
            {TABS.map(([v, label]) => tab(v, t(label, ({search:'検索', library:'ライブラリ', collections:'コレクション'} as Record<View, string>)[v]), true))}
          </div>
          {contextBar}
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-x-4">
            <div className="flex shrink-0 items-center gap-x-3">
              <Logo />
              <div className="flex items-center gap-1">
                {TABS.map(([v, label]) => tab(v, t(label, ({search:'検索', library:'ライブラリ', collections:'コレクション'} as Record<View, string>)[v]), false))}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-x-3">
              {resultCountText && (
                <span
                  className="shrink-0 whitespace-nowrap text-xs text-ink-muted"
                  aria-live="polite"
                >
                  {resultCountText}
                </span>
              )}
              <DownloadQuota />
              <AuthBar />
              {menu}
            </div>
          </div>
          {contextBar}
        </>
      )}
    </header>
  )
}
