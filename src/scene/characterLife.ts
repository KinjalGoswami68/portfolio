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

// ---- small natural actions every 8 to 12 seconds ----

export type GestureKind = 'lookAround' | 'wave' | 'weightShift'

export type GestureState = {
  kind: GestureKind | null // what she's doing now, or null
  startedAt: number
  nextAt: number // clock time of the next action
}

const GESTURE_KINDS: GestureKind[] = ['lookAround', 'wave', 'weightShift']
const GESTURE_SECONDS: Record<GestureKind, number> = { lookAround: 3, wave: 1.8, weightShift: 2.5 }

function randomGestureGap() {
  return character.gestureGapMin + Math.random() * (character.gestureGapMax - character.gestureGapMin)
}

export function newGestureState(): GestureState {
  return { kind: null, startedAt: 0, nextAt: randomGestureGap() }
}

// Starts and ends actions on schedule. Returns how far along the current one is (0 to 1), or -1.
export function updateGesture(gesture: GestureState, time: number) {
  if (!gesture.kind && time >= gesture.nextAt) {
    gesture.kind = GESTURE_KINDS[Math.floor(Math.random() * GESTURE_KINDS.length)]
    gesture.startedAt = time
  }
  if (!gesture.kind) return -1
  const progress = (time - gesture.startedAt) / GESTURE_SECONDS[gesture.kind]
  if (progress >= 1) {
    gesture.kind = null
    gesture.nextAt = time + randomGestureGap()
    return -1
  }
  return progress
}

// The two actions made in code, added on top of the idle pose. (The wave uses wave.fbx instead.)
export function applyGesturePose(vrm: VRM, kind: GestureKind, progress: number) {
  const ease = Math.sin(progress * Math.PI) // 0 -> 1 -> 0: starts and ends softly
  if (kind === 'lookAround') {
    // head looks to one side, then the other
    vrm.humanoid.getNormalizedBoneNode('head')?.rotateY(Math.sin(progress * Math.PI * 2) * 0.45 * ease)
  }
  if (kind === 'weightShift') {
    // hips slide a little to one side and tilt, upper body leans back to balance
    const hips = vrm.humanoid.getNormalizedBoneNode('hips')
    if (hips) {
      hips.position.x += 0.03 * ease
      hips.rotateZ(0.05 * ease)
    }
    vrm.humanoid.getNormalizedBoneNode('spine')?.rotateZ(-0.06 * ease)
  }
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
