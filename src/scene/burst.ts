import * as THREE from 'three'
import { ring } from '../theme'

// The gold sparkle burst when a panel opens: a cloud of glowing dots ("points")
// spread over a flat box the size of the open panel. ProjectRing grows and fades it.

// Random dot positions, made once when the site loads.
export function makeBurstGeometry() {
  const width = ring.panelWidth * 1.3
  const height = ring.panelHeight * 1.4
  const depth = 0.6
  const positions = new Float32Array(ring.burstCount * 3)
  for (let i = 0; i < ring.burstCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * width
    positions[i * 3 + 1] = (Math.random() - 0.5) * height
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

// A soft round dot (bright middle, fading edge), so each point looks like a sparkle, not a square.
export function makeDotTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

// Fades the burst: fully visible at the start, gone at the end (progress 0 -> 1).
export function fadeBurst(material: THREE.PointsMaterial, progress: number) {
  material.opacity = (1 - progress) ** 1.5 // fades slowly at first, then faster
}
