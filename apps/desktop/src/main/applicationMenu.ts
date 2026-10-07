import { app, BrowserWindow, dialog, Menu } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'

type Locale = 'en' | 'ja'

const text = (locale: Locale, en: string, ja: string): string =>
  locale === 'ja' ? ja : en

export function installApplicationMenu(locale: Locale): void {
  const label = (en: string, ja: string) => text(locale, en, ja)
  const template: MenuItemConstructorOptions[] = [
    {
      label: label('File', 'ファイル'),
      submenu: [
        { label: label('Close Window', 'ウィンドウを閉じる'), role: 'close' },
        { type: 'separator' },
        { label: label('Quit', '終了'), role: 'quit' },
      ],
    },
    {
      label: label('Edit', '編集'),
      submenu: [
        { label: label('Undo', '元に戻す'), role: 'undo' },
        { label: label('Redo', 'やり直す'), role: 'redo' },
        { type: 'separator' },
        { label: label('Cut', '切り取り'), role: 'cut' },
        { label: label('Copy', 'コピー'), role: 'copy' },
        { label: label('Paste', '貼り付け'), role: 'paste' },
        { label: label('Select All', 'すべて選択'), role: 'selectAll' },
      ],
    },
    {
      label: label('View', '表示'),
      submenu: [
        { label: label('Reload', '再読み込み'), role: 'reload' },
        { label: label('Toggle Developer Tools', '開発者ツール'), role: 'toggleDevTools' },
        { type: 'separator' },
        { label: label('Actual Size', '元のサイズ'), role: 'resetZoom' },
        { label: label('Zoom In', '拡大'), role: 'zoomIn' },
        { label: label('Zoom Out', '縮小'), role: 'zoomOut' },
        { type: 'separator' },
        { label: label('Toggle Full Screen', '全画面表示'), role: 'togglefullscreen' },
      ],
    },
    {
      label: label('Window', 'ウィンドウ'),
      submenu: [
        { label: label('Minimize', '最小化'), role: 'minimize' },
        { label: label('Close', '閉じる'), role: 'close' },
      ],
    },
    {
      label: label('Help', 'ヘルプ'),
      submenu: [
        {
          label: label('About SDS-Sound', 'SDS-Sound について'),
          click: () => {
            const window = BrowserWindow.getFocusedWindow()
            const options = {
              type: 'info' as const,
              title: label('About SDS-Sound', 'SDS-Sound について'),
              message: `SDS-Sound ${app.getVersion()}`,
              detail: label(
                'MIT License · © 2026 Super Duper Software',
                'MIT ライセンス · © 2026 Super Duper Software',
              ),
            }
            if (window) void dialog.showMessageBox(window, options)
            else void dialog.showMessageBox(options)
          },
        },
      ],
    },
  ]

  if (process.platform === 'darwin') {
    template.unshift({ role: 'appMenu' })
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

export async function syncApplicationMenuFromWindow(window: BrowserWindow): Promise<void> {
  try {
    const preference = await window.webContents.executeJavaScript(
      "window.localStorage.getItem('super-duper-locale') || window.navigator.language",
    ) as string
    installApplicationMenu(preference.toLowerCase().startsWith('ja') ? 'ja' : 'en')
  } catch {
    // Keep the OS-language menu if the renderer is unavailable.
  }
}
