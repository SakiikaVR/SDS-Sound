import { execFileSync } from 'node:child_process'
import { copyFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const desktopDir = fileURLToPath(new URL('..', import.meta.url))

function installedVersion(name) {
  return JSON.parse(readFileSync(join(desktopDir, 'node_modules', name, 'package.json'), 'utf8')).version
}

/** @param {import('electron-builder').AfterPackContext} context */
export default async function afterPack(context) {
  if (context.electronPlatformName === 'win32') {
    if (installedVersion('better-sqlite3') !== '12.11.1' || installedVersion('electron') !== '32.3.3') {
      throw new Error('Update the pinned Electron ABI 128 better-sqlite3 binary before packaging.')
    }
    // electron-builder can copy pnpm's Node ABI binary despite reporting a rebuild.
    // Use the official better-sqlite3 Electron v128 x64 release asset instead.
    const nativeBinary = fileURLToPath(new URL('../../../third_party/better-sqlite3/better_sqlite3-electron-v128-win32-x64.node', import.meta.url))
    const target = join(context.appOutDir, 'resources', 'app.asar.unpacked', 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node')
    copyFileSync(nativeBinary, target)
    console.log('afterPack: installed pinned better-sqlite3 Electron ABI 128 binary')
    return
  }
  if (context.electronPlatformName !== 'darwin') return

  // A Developer ID cert is present: electron-builder will sign (and notarize)
  // the bundle itself. Skip the ad-hoc fallback so it does not fight that.
  if (process.env.CSC_LINK || process.env.CSC_NAME) {
    console.log('afterPack: Developer ID cert present, skipping ad-hoc sign')
    return
  }

  const appName = `${context.packager.appInfo.productFilename}.app`
  const appPath = join(context.appOutDir, appName)

  execFileSync(
    'codesign',
    ['--force', '--deep', '--sign', '-', '--timestamp=none', appPath],
    { stdio: 'inherit' },
  )
  execFileSync('codesign', ['--verify', '--verbose=2', appPath], {
    stdio: 'inherit',
  })
  console.log(`afterPack: ad-hoc signed ${appName}`)
}
