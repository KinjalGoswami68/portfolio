// node scripts/shrink-vrm.mjs
// Makes the small, shipped copy of the character: source-assets/kinjal.vrm -> public/models/kinjal.vrm
//
// A .vrm is a .glb file: a JSON part (bones, expressions, materials, VRMC_* extensions)
// and a binary part (mesh data + the texture images). This script only re-encodes the images.
// The JSON is kept exactly as it was, except for the fields that MUST change when image sizes change:
// images[].mimeType, bufferViews[].byteOffset / byteLength, buffers[0].byteLength.
// It checks that at the end and refuses to write the file if anything else differs.
//
// Uses sharp (dev dependency) for resizing and encoding. PNG and JPEG load in GLTFLoader + three-vrm with no extra setup.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(root, 'source-assets/kinjal.vrm')
const OUTPUT = path.join(root, 'public/models/kinjal.vrm')

// what to do with each image, by its index in the file (see the table printed by this script).
// max = longest side in pixels. png = lossless (normal maps, see-through textures), jpeg = opaque colour textures
const PLAN = {
  // the face is framed close in the intro: at 1024 px her eyes were visibly softer, so the two face colour textures stay at 2048
  0: { max: 2048, format: 'png', note: 'face, eyes, mouth (see-through edges)' },
  1: { max: 1024, format: 'jpeg', note: 'face glow (emissive)' },
  2: { max: 1024, format: 'png', note: 'face normal map' },
  // the dress top is framed close in the intro: at 1024 px its lace, quilting and rose turned blocky.
  // 2048 px looks the same as the original there, and needs a quarter of the graphics memory of 4096 px
  // (about 124 MB for all her textures instead of 252 MB), which matters on integrated graphics
  3: { max: 2048, format: 'png', note: 'body, clothes, hair (see-through edges)' },
  4: { max: 1024, format: 'jpeg', note: 'body glow (emissive)' },
  5: { max: 2048, format: 'png', note: 'body normal map' },
  6: { max: 256, format: 'jpeg', note: 'VRM thumbnail (never drawn on screen)' },
  7: { max: 2048, format: 'jpeg', note: 'face shade colour' },
  9: { max: 256, format: 'png', note: 'face outline width' },
  11: { max: 2048, format: 'jpeg', note: 'body shade colour' },
  12: { max: 256, format: 'png', note: 'body outline width' },
  // 8 and 10 are 8x8 pixel images: left as they are
}
const JPEG_QUALITY = 88

const align4 = (n) => Math.ceil(n / 4) * 4

function readGlb(buffer) {
  if (buffer.toString('utf8', 0, 4) !== 'glTF') throw new Error('not a glb/vrm file')
  const jsonLength = buffer.readUInt32LE(12)
  const json = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength))
  const binStart = 20 + jsonLength
  const binLength = buffer.readUInt32LE(binStart)
  const bin = buffer.subarray(binStart + 8, binStart + 8 + binLength)
  return { json, bin }
}

function writeGlb(json, bin) {
  let jsonBytes = Buffer.from(JSON.stringify(json), 'utf8')
  jsonBytes = Buffer.concat([jsonBytes, Buffer.alloc(align4(jsonBytes.length) - jsonBytes.length, 0x20)]) // pad with spaces
  const binBytes = Buffer.concat([bin, Buffer.alloc(align4(bin.length) - bin.length)]) // pad with zeros
  const header = Buffer.alloc(12)
  header.write('glTF', 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(12 + 8 + jsonBytes.length + 8 + binBytes.length, 8)
  const chunk = (bytes, type) => {
    const head = Buffer.alloc(8)
    head.writeUInt32LE(bytes.length, 0)
    head.write(type, 4)
    return Buffer.concat([head, bytes])
  }
  return Buffer.concat([header, chunk(jsonBytes, 'JSON'), chunk(binBytes, 'BIN\0')])
}

// resize colour and alpha separately, so the colour hidden under see-through pixels survives
// (otherwise it turns black and hair tips get dark edges)
async function encode(input, { max, format }) {
  const meta = await sharp(input).metadata()
  const size = Math.min(max, Math.max(meta.width, meta.height))
  const hasAlpha = meta.channels === 4 && !(await sharp(input).stats()).isOpaque
  if (format === 'jpeg') {
    const data = await sharp(input).resize(size, size, { fit: 'inside' }).removeAlpha().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
    return { data, mimeType: 'image/jpeg', size }
  }
  let image
  if (hasAlpha) {
    // the two halves are resized on their own, then put back together pixel by pixel (R, G, B, A)
    const colour = await sharp(input).removeAlpha().resize(size, size, { fit: 'inside' }).raw().toBuffer({ resolveWithObject: true })
    const alpha = await sharp(input).extractChannel(3).resize(size, size, { fit: 'inside' }).raw().toBuffer()
    const { width, height } = colour.info
    const rgba = Buffer.alloc(width * height * 4)
    for (let p = 0; p < width * height; p++) {
      rgba[p * 4] = colour.data[p * 3]
      rgba[p * 4 + 1] = colour.data[p * 3 + 1]
      rgba[p * 4 + 2] = colour.data[p * 3 + 2]
      rgba[p * 4 + 3] = alpha[p]
    }
    image = sharp(rgba, { raw: { width, height, channels: 4 } })
  } else {
    image = sharp(input).removeAlpha().resize(size, size, { fit: 'inside' })
  }
  const data = await image.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
  return { data, mimeType: 'image/png', size }
}

const source = fs.readFileSync(SOURCE)
const { json, bin } = readGlb(source)
const original = structuredClone(json)

// new bytes for each image's bufferView
const replaced = new Map() // bufferView index -> new bytes
const rows = []
for (const [i, image] of json.images.entries()) {
  const view = json.bufferViews[image.bufferView]
  const bytes = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
  const meta = await sharp(bytes).metadata()
  const plan = PLAN[i]
  if (!plan) {
    rows.push([i, `${meta.width}px ${image.mimeType}`, 'kept', bytes.length, bytes.length, ''])
    continue
  }
  const out = await encode(bytes, plan)
  // never make an image bigger than it was
  if (out.data.length >= bytes.length && out.mimeType === image.mimeType) {
    rows.push([i, `${meta.width}px ${image.mimeType}`, 'kept (no gain)', bytes.length, bytes.length, plan.note])
    continue
  }
  replaced.set(image.bufferView, out.data)
  image.mimeType = out.mimeType
  rows.push([i, `${meta.width}px ${original.images[i].mimeType}`, `${out.size}px ${out.mimeType}`, bytes.length, out.data.length, plan.note])
}

// rebuild the binary part: every bufferView in order, images swapped, each start aligned to 4 bytes
const pieces = []
let offset = 0
for (const [i, view] of json.bufferViews.entries()) {
  const bytes = replaced.get(i) ?? bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
  const start = align4(offset)
  if (start > offset) pieces.push(Buffer.alloc(start - offset))
  pieces.push(bytes)
  view.byteOffset = start
  view.byteLength = bytes.length
  offset = start + bytes.length
}
const newBin = Buffer.concat(pieces)
json.buffers[0].byteLength = newBin.length

// safety check: the JSON must be identical apart from the allowed fields
const strip = (j) => {
  const c = structuredClone(j)
  c.images.forEach((im) => delete im.mimeType)
  c.bufferViews.forEach((v) => {
    delete v.byteOffset
    delete v.byteLength
  })
  c.buffers.forEach((b) => delete b.byteLength)
  return c
}
if (!isDeepStrictEqual(strip(original), strip(json))) throw new Error('JSON changed outside the allowed fields. Not writing.')
if (!isDeepStrictEqual(original.extensions, json.extensions)) throw new Error('VRMC extensions changed. Not writing.')

const output = writeGlb(json, newBin)
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, output)

const kb = (n) => `${(n / 1024).toFixed(0)} KB`
console.log('image  before            after                 bytes before -> after   what')
for (const [i, from, to, a, b, note] of rows) {
  console.log(`${String(i).padStart(5)}  ${from.padEnd(16)}  ${to.padEnd(20)}  ${kb(a).padStart(9)} -> ${kb(b).padEnd(9)}  ${note}`)
}
const imagesBefore = rows.reduce((s, r) => s + r[3], 0)
const imagesAfter = rows.reduce((s, r) => s + r[4], 0)
console.log(`images: ${kb(imagesBefore)} -> ${kb(imagesAfter)}`)
console.log(`file:   ${(source.length / 1e6).toFixed(2)} MB -> ${(output.length / 1e6).toFixed(2)} MB  (${path.relative(root, OUTPUT)})`)
console.log('JSON check: identical except image types and byte positions. extensions:', json.extensionsUsed.join(', '))
