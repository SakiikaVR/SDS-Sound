import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import type { Core } from '../core'

/**
 * The IPC surface. `core:invoke` forwards any `Core` command verbatim; the
 * named channels are the handful of things the core cannot do for itself
 * because they need Electron (`shell`, `dialog`).
 */
export function registerIpc(core: Core): void {
  ipcMain.handle('core:search', (_event, query: string, opts?: unknown) =>
    core.search(query, opts as Parameters<Core['search']>[1]),
  )

  ipcMain.handle('core:revealInFinder', (_event, soundId: number) => {
    const path = core.getContentPath(soundId)
    if (path) shell.showItemInFolder(path)
  })

  ipcMain.handle('core:openExternal', (_event, soundId: number) => {
    const url = core.getFreesoundUrl(soundId)
    if (url) return shell.openExternal(url)
  })

  ipcMain.handle('core:showLogs', () => {
    const path = core.getLogPath()
    if (path && existsSync(path)) shell.showItemInFolder(path)
    else void shell.openPath(join(app.getPath('userData'), 'logs'))
  })

  ipcMain.handle('core:importLocalFiles', async () => {
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    const options = {
      properties: ['openFile', 'multiSelections'] as Array<'openFile' | 'multiSelections'>,
      filters: [{ name: 'Audio', extensions: ['wav', 'aiff', 'aif', 'flac', 'mp3', 'ogg', 'm4a'] }],
    }
    const result = await (win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options))
    if (result.canceled) return []
    const imported: number[] = []
    for (const filePath of result.filePaths) {
      const { soundId } = await core.importLocalFile(filePath)
      imported.push(soundId)
    }
    return imported
  })

  ipcMain.handle(
    'core:saveManifest',
    async (_event, defaultFileName: string, text: string) => {
      const win =
        BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
      const options = {
        defaultPath: defaultFileName,
        filters: [{ name: 'Text', extensions: ['txt'] }],
      }
      const result = await (win
        ? dialog.showSaveDialog(win, options)
        : dialog.showSaveDialog(options))
      if (result.canceled || !result.filePath) return { saved: false }
      await writeFile(result.filePath, text, 'utf8')
      return { saved: true, path: result.filePath }
    },
  )

  ipcMain.handle(
    'core:invoke',
    (_event, method: string, args: unknown[] = []) => {
      const fn = (core as unknown as Record<string, unknown>)[method]
      if (typeof fn !== 'function') {
        throw new Error(`unknown core command: ${method}`)
      }
      return (fn as (...a: unknown[]) => unknown)(...args)
    },
  )
}
