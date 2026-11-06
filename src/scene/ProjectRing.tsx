import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '../data/projects'
import { ring } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import ProjectPanel from './ProjectPanel'

// All project panels, spaced evenly in a circle around the character.
// The first project (leash) starts in front, facing the camera.
// shown = false fades the whole ring out (the intro), true fades it in.
export default function ProjectRing({ shown }: { shown: boolean }) {
  // a ref = a direct handle to the real three.js group
  const ringRef = useRef<THREE.Group>(null)
  const opacityRef = useRef(0) // starts invisible (the site opens on the intro)

  // runs every frame. delta = seconds since the last frame,
  // so the speed is the same on fast and slow computers
  useFrame((_state, delta) => {
    const group = ringRef.current
    if (!group) return
    group.rotation.y += ring.spinSpeed * delta

    // fade: glide the opacity toward 1 (shown) or 0 (hidden). reduced motion = instant
    const goal = shown ? 1 : 0
    opacityRef.current = prefersReducedMotion
      ? goal
      : THREE.MathUtils.damp(opacityRef.current, goal, ring.fadeSpeed, Math.min(delta, 0.1))

    // fully hidden = skip drawing it at all (saves work, including in the floor reflection)
    group.visible = opacityRef.current > 0.01
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material.opacity = opacityRef.current
      }
    })
  })

  // full circle (2 * PI radians = 360 degrees) split evenly between projects
  const step = (Math.PI * 2) / projects.length

  return (
    <group ref={ringRef}>
      {projects.map((project, i) => (
        // minus sign: the next project waits on the right, so the spin brings them in order
        <group key={project.id} rotation={[0, -i * step, 0]}>
          <ProjectPanel project={project} />
        </group>
      ))}
    </group>
  )
}
