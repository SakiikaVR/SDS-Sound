import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const resources = join(dirname(fileURLToPath(import.meta.url)), '..', 'resources')
const svg = readFileSync(join(resources, 'icon.svg'))

const render = (size) =>
  sharp(svg, { density: Math.max(96, Math.ceil((size / 1024) * 96)) })
    .resize(size, size)
    .png()
    .toBuffer()

const png1024 = await render(1024)
writeFileSync(join(resources, 'icon-1024.png'), png1024)

const icoSizes = [16, 24, 32, 48, 64, 128, 256]
const icoFrames = await Promise.all(icoSizes.map(async (size) => ({ size, data: await render(size) })))
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(icoFrames.length, 4)
const icoDirectory = Buffer.alloc(icoFrames.length * 16)
let offset = icoHeader.length + icoDirectory.length
for (const [index, frame] of icoFrames.entries()) {
  const entry = index * 16
  icoDirectory.writeUInt8(frame.size === 256 ? 0 : frame.size, entry)
  icoDirectory.writeUInt8(frame.size === 256 ? 0 : frame.size, entry + 1)
  icoDirectory.writeUInt16LE(1, entry + 4)
  icoDirectory.writeUInt16LE(32, entry + 6)
  icoDirectory.writeUInt32LE(frame.data.length, entry + 8)
  icoDirectory.writeUInt32LE(offset, entry + 12)
  offset += frame.data.length
}
writeFileSync(join(resources, 'icon.ico'), Buffer.concat([icoHeader, icoDirectory, ...icoFrames.map((f) => f.data)]))

const icnsFrames = await Promise.all(
  [
    [128, 'ic07'],
    [256, 'ic08'],
    [512, 'ic09'],
    [1024, 'ic10'],
  ].map(async ([size, type]) => ({ type, data: await render(size) })),
)
const icnsChunks = icnsFrames.map(({ type, data }) => {
  const header = Buffer.alloc(8)
  header.write(type, 0, 'ascii')
  header.writeUInt32BE(data.length + 8, 4)
  return Buffer.concat([header, data])
})
const icnsHeader = Buffer.alloc(8)
icnsHeader.write('icns', 0, 'ascii')
icnsHeader.writeUInt32BE(8 + icnsChunks.reduce((sum, chunk) => sum + chunk.length, 0), 4)
writeFileSync(join(resources, 'icon.icns'), Buffer.concat([icnsHeader, ...icnsChunks]))

console.log(`Generated icon PNG, ICO and ICNS from ${join(resources, 'icon.svg')}`)
