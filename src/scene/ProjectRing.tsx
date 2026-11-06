import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { projects } from '../data/projects'
import { ring } from '../theme'
import ProjectPanel from './ProjectPanel'

// All project panels, spaced evenly in a circle around the character.
// The first project (leash) starts in front, facing the camera.
export default function ProjectRing() {
  // a ref = a direct handle to the real three.js group
  const ringRef = useRef<Group>(null)

  // runs every frame. delta = seconds since the last frame,
  // so the speed is the same on fast and slow computers
  useFrame((_state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += ring.spinSpeed * delta
    }
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
