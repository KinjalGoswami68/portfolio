import type { Object3D } from 'three'
import type { VRM } from '@pixiv/three-vrm'
import { character } from '../theme'

// Small things that make her feel alive. Each is called once per frame from VrmCharacter.

// ---- blinking ----

export type BlinkState = {
  nextBlinkAt: number // clock time of the next blink
  startedAt: number // clock time the current blink started, or -1 if not blinking
}

function randomGap() {
  return character.blinkGapMin + Math.random() * (character.blinkGapMax - character.blinkGapMin)
}

export function newBlinkState(): BlinkState {
  return { nextBlinkAt: randomGap(), startedAt: -1 }
}

// Closes and opens her eyes using the VRM "blink" expression (0 = open, 1 = closed).
export function updateBlink(vrm: VRM, blink: BlinkState, time: number) {
  if (blink.startedAt < 0 && time >= blink.nextBlinkAt) {
    blink.startedAt = time
  }
  let closed = 0
  if (blink.startedAt >= 0) {
    const progress = (time - blink.startedAt) / character.blinkSeconds // 0 to 1
    if (progress >= 1) {
      blink.startedAt = -1
      blink.nextBlinkAt = time + randomGap()
    } else {
      // first half closes, second half opens
      closed = progress < 0.5 ? progress * 2 : 2 - progress * 2
    }
  }
  vrm.expressionManager?.setValue('blink', closed)
}

// ---- head follows the mouse ----

// Adds a small turn on top of whatever pose the animation gave the head this frame.
// yaw: + = toward the screen's right (her left). pitch: + = up.
export function turnHead(vrm: VRM, yaw: number, pitch: number) {
  const head = vrm.humanoid.getNormalizedBoneNode('head')
  if (!head) return
  head.rotateY(yaw)
  head.rotateX(-pitch) // rotating forward around x tips the face down, so minus = up
}

// ---- eyes ----

// Points her eyes at a target object with vrm.lookAt (vrm.update does the actual turning).
// null = stop following and look straight ahead.
export function aimEyes(vrm: VRM, target: Object3D | null) {
  if (!vrm.lookAt) return
  vrm.lookAt.target = target
  if (!target) vrm.lookAt.reset()
}

// ---- fallback pose (no animation files) ----

// Lowers both arms from the T-pose to her sides (angles in radians, about 70 degrees).
export function armsDown(vrm: VRM) {
  const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm')
  const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm')
  if (leftArm) leftArm.rotation.z = -1.2
  if (rightArm) rightArm.rotation.z = 1.2
}

// Tiny chest rise and fall plus a slow sway, used when there's no animation playing.
export function breathe(vrm: VRM, time: number) {
  const chest = vrm.humanoid.getNormalizedBoneNode('chest')
  const spine = vrm.humanoid.getNormalizedBoneNode('spine')
  const head = vrm.humanoid.getNormalizedBoneNode('head')
  if (chest) chest.rotation.x = Math.sin(time * 1.6) * 0.02
  if (spine) spine.rotation.z = Math.sin(time * 0.5) * 0.015
  // no animation resets the head each frame here, so reset it ourselves before turnHead adds to it
  if (head) head.rotation.set(0, 0, 0)
}
