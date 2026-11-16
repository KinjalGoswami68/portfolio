// node scripts/verify-vrm.mjs [file]
// Loads a .vrm in Node with the same loaders the site uses (GLTFLoader + three-vrm) and checks
// that everything the character needs is still there, then retargets walk/wave/idle onto it
// with the site's own src/scene/mixamo.ts. Exits with an error if any check fails.
//
// Node has no image decoder or WebGL, so textures are swapped for 1x1 stand-ins here.
// That's fine: this checks the structure (bones, face, physics, materials), not the pixels.

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = process.argv[2] ?? path.join(root, 'public/models/kinjal.vrm')

// stand-ins for browser-only things GLTFLoader touches
globalThis.self = globalThis
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} })
globalThis.ProgressEvent ??= class ProgressEvent extends Event {
  constructor(type, init = {}) {
    super(type)
    Object.assign(this, init)
  }
}

const THREE = await import('three')
const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
const { VRMLoaderPlugin } = await import('@pixiv/three-vrm')
const { loadMixamoAnimation } = await import('../src/scene/mixamo.ts')

const results = []
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail })

const bytes = fs.readFileSync(file)
const loader = new GLTFLoader()
loader.register((parser) => new VRMLoaderPlugin(parser))
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
const gltf = await loader.parseAsync(buffer, '')
const vrm = gltf.userData.vrm

check('VRM loaded', vrm)
check('VRM 1.0', vrm?.meta?.metaVersion === '1', `metaVersion ${vrm?.meta?.metaVersion}`)
const boneCount = Object.values(vrm.humanoid.humanBones).filter((b) => b?.node).length
check('54 humanoid bones', boneCount === 54, `${boneCount} bones`)
check('blink expression', vrm.expressionManager?.getExpression('blink'))
check('blinkLeft / blinkRight', vrm.expressionManager?.getExpression('blinkLeft') && vrm.expressionManager?.getExpression('blinkRight'))
check('lookAt', vrm.lookAt, vrm.lookAt ? `type ${vrm.lookAt.applier?.type ?? 'unknown'}` : '')
const joints = vrm.springBoneManager ? vrm.springBoneManager.joints.size : 0
check('spring bones (hair/cloth physics)', joints > 0, `${joints} joints`)
const mtoon = new Set()
vrm.scene.traverse((o) => {
  if (o.isMesh) [].concat(o.material).forEach((m) => m.isMToonMaterial && mtoon.add(m.name))
})
check('MToon materials', mtoon.size > 0, `${mtoon.size} materials`)

// serve public/animations so FBXLoader can fetch them the way the site does
const server = http.createServer((req, res) => {
  const target = path.join(root, 'public', decodeURIComponent(req.url))
  if (!fs.existsSync(target)) return res.writeHead(404).end()
  res.writeHead(200).end(fs.readFileSync(target))
})
await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}/animations/`
for (const [name, inPlace] of [['walk.fbx', true], ['wave.fbx', false], ['idle.fbx', false]]) {
  try {
    const { clip } = await loadMixamoAnimation(base + name, vrm, inPlace)
    // play one frame to be sure the tracks find their bones
    const mixer = new THREE.AnimationMixer(vrm.scene)
    mixer.clipAction(clip).play()
    mixer.update(0.5)
    check(`${name} retargets`, clip.tracks.length > 0, `${clip.tracks.length} tracks, ${clip.duration.toFixed(2)} s`)
  } catch (error) {
    check(`${name} retargets`, false, String(error))
  }
}
server.close()

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`)
if (results.some((r) => !r.ok)) process.exit(1)
