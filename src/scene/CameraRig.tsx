import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cameraViews } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import type { View } from '../App'
import { sceneState } from '../sceneState'

const FULL_TURN = Math.PI * 2
const { orbit } = cameraViews

// Glides the camera between the intro close-up and the ring view.
// In the ring view, dragging orbits it around her (App.tsx records the drag in sceneState).
export default function CameraRig({ view }: { view: View }) {
  // the point the camera is looking at right now (it glides too)
  const lookingAt = useMemo(() => new THREE.Vector3(...cameraViews.intro.target), [])
  // the orbit angles the camera is actually at now. they chase the goal in sceneState smoothly
  const current = useRef({ yaw: 0, pitch: 0 })

  useFrame(({ camera, pointer }, delta) => {
    const dt = Math.min(delta, 0.1)
    const goal = cameraViews[view]
    const goalPosition = new THREE.Vector3(...goal.position)
    const goalTarget = new THREE.Vector3(...goal.target)
    const snap = prefersReducedMotion || sceneState.orbitSnap // jump instead of glide

    if (view === 'ring') {
      // scrolling into the chapters blends toward the pulled-back "chapters" spot
      if (!prefersReducedMotion) {
        const blend = THREE.MathUtils.smoothstep(sceneState.chapterProgress, 0, 0.6)
        goalPosition.lerp(new THREE.Vector3(...cameraViews.chapters.position), blend)
        goalTarget.lerp(new THREE.Vector3(...cameraViews.chapters.target), blend)
      }

      // about 3 seconds after the last drag: glide back to the default angle
      // (to the nearest full turn, so it never spins round several times to get home)
      const idleSeconds = (performance.now() - sceneState.lastOrbitDragAt) / 1000
      if (!prefersReducedMotion && idleSeconds > orbit.returnDelay) {
        const home = Math.round(sceneState.orbitYaw / FULL_TURN) * FULL_TURN
        sceneState.orbitYaw = THREE.MathUtils.damp(sceneState.orbitYaw, home, orbit.returnSpeed, dt)
        sceneState.orbitPitch = THREE.MathUtils.damp(sceneState.orbitPitch, 0, orbit.returnSpeed, dt)
      }

      // smooth damping: the real angles chase the goal angles
      const now = current.current
      now.yaw = snap ? sceneState.orbitYaw : THREE.MathUtils.damp(now.yaw, sceneState.orbitYaw, orbit.ease, dt)
      now.pitch = snap ? sceneState.orbitPitch : THREE.MathUtils.damp(now.pitch, sceneState.orbitPitch, orbit.ease, dt)

      // plus a tiny turn from where the mouse is (not with reduced motion)
      const [driftYaw, driftPitch] = orbit.mouseDrift
      const yaw = now.yaw + (prefersReducedMotion ? 0 : pointer.x * driftYaw)
      const pitch = now.pitch + (prefersReducedMotion ? 0 : pointer.y * driftPitch)
      orbitAround(goalPosition, goalTarget, yaw, pitch)
    } else {
      // intro: no orbit. keep the real angles at the goal (reset to the default by App)
      current.current.yaw = sceneState.orbitYaw
      current.current.pitch = sceneState.orbitPitch
    }
    if (view === 'intro' && !prefersReducedMotion) {
      // intro: just a gentle drift. pointer goes from -1 (left/bottom) to 1 (right/top)
      const [driftX, driftY] = cameraViews.introDrift
      goalPosition.x += pointer.x * driftX
      goalPosition.y += pointer.y * driftY
    }

    if (snap) {
      camera.position.copy(goalPosition)
      lookingAt.copy(goalTarget)
    } else {
      // move a fraction of the remaining distance each frame: fast at first, then settles
      const amount = 1 - Math.exp(-cameraViews.moveSpeed * dt)
      camera.position.lerp(goalPosition, amount)
      lookingAt.lerp(goalTarget, amount)
    }
    sceneState.orbitSnap = false
    camera.lookAt(lookingAt)
  })

  return null // it draws nothing, it only moves the camera
}

// Swings a camera position around the target, like a camera on a boom arm.
// Spherical = the same position described as distance + angle around + angle down from straight up.
function orbitAround(position: THREE.Vector3, target: THREE.Vector3, yaw: number, pitch: number) {
  const offset = new THREE.Spherical().setFromVector3(position.clone().sub(target))
  offset.theta += yaw // around the vertical axis: full 360 is fine
  // phi is measured from straight up, so tilting up = smaller phi. keep it between the limits:
  // never below the floor (minElevation), never straight top-down (maxElevation)
  const highest = THREE.MathUtils.degToRad(90 - orbit.maxElevation)
  const lowest = THREE.MathUtils.degToRad(90 - orbit.minElevation)
  offset.phi = THREE.MathUtils.clamp(offset.phi - pitch, highest, lowest)
  position.copy(target).add(new THREE.Vector3().setFromSpherical(offset))
}
