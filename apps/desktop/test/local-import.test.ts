import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { makeTempDir, makeTestCore, makeWav } from './helpers'

describe('local audio import', () => {
  it('copies a file into the Library, restores it from its sidecar, and removes it', async () => {
    const dataDir = await makeTempDir('local-import-')
    const source = join(dataDir, 'my sound.wav')
    const audio = makeWav(8000)
    await writeFile(source, audio)

    const first = await makeTestCore({ dataDir })
    const { soundId } = await first.core.importLocalFile(source)
    expect(soundId).toBeLessThan(0)
    const stored = first.core.getContentPath(soundId)!
    expect(stored).not.toBe(source)
    expect(await readFile(stored)).toEqual(audio)
    expect(first.core.listLibrary().map((sound) => sound.id)).toContain(soundId)
    first.core.close()

    const second = await makeTestCore({ dataDir, dbPath: join(dataDir, 'restored.db') })
    const report = await second.core.rebuildFromSidecars()
    expect(report.recovered.map((item) => item.soundId)).toContain(soundId)
    expect(second.core.getContentPath(soundId)).toBe(stored)
    await second.core.deleteFromLibrary(soundId)
    expect(existsSync(stored)).toBe(false)
    expect(existsSync(stored.replace(/\.wav$/, '.json'))).toBe(false)
  })
})
