import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cameraViews } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import type { View } from '../App'

// Glides the camera between the intro close-up and the ring view.
export default function CameraRig({ view }: { view: View }) {
  // the point the camera is looking at right now (it glides too)
  const lookingAt = useMemo(() => new THREE.Vector3(...cameraViews.intro.target), [])

  useFrame(({ camera }, delta) => {
    const goal = cameraViews[view]
    const goalPosition = new THREE.Vector3(...goal.position)
    const goalTarget = new THREE.Vector3(...goal.target)

    if (prefersReducedMotion) {
      // instant cut
      camera.position.copy(goalPosition)
      lookingAt.copy(goalTarget)
    } else {
      // move a fraction of the remaining distance each frame: fast at first, then settles
      const amount = 1 - Math.exp(-cameraViews.moveSpeed * Math.min(delta, 0.1))
      camera.position.lerp(goalPosition, amount)
      lookingAt.lerp(goalTarget, amount)
    }
    camera.lookAt(lookingAt)
  })

  return null // it draws nothing, it only moves the camera
}
