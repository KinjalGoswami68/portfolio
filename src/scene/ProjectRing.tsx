import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '../data/projects'
import { ring } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import { sceneState } from '../sceneState'
import ProjectPanel from './ProjectPanel'

// full circle (2 * PI radians = 360 degrees) split evenly between projects
const STEP = (Math.PI * 2) / projects.length

// All project panels, spaced evenly in a circle around the character.
// The first project (leash) starts in front, facing the camera.
// shown = false fades the whole ring out (the intro), true fades it in.
export default function ProjectRing({ shown }: { shown: boolean }) {
  // a ref = a direct handle to the real three.js group
  const ringRef = useRef<THREE.Group>(null)
  const panelRefs = useRef<(THREE.Group | null)[]>([]) // one handle per panel
  const revealRef = useRef(0) // whole-ring fade: starts invisible (the site opens on the intro)
  const autoAngleRef = useRef(0) // the slow spin it always does by itself
  const extraAngleRef = useRef(0) // the extra spin from scrolling and dragging
  const presenceRef = useRef(projects.map(() => 1)) // per panel: 1 = there, 0 = faded out (in front of her)

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1)
    const group = ringRef.current
    if (!group) return

    // spin: always slowly by itself, plus whatever scrolling and dragging add
    autoAngleRef.current += ring.spinSpeed * dt
    const extraGoal = sceneState.scrollScreens * ring.scrollTurn + sceneState.dragAngle
    extraAngleRef.current = prefersReducedMotion
      ? extraGoal
      : THREE.MathUtils.damp(extraAngleRef.current, extraGoal, ring.spinEase, dt)
    group.rotation.y = autoAngleRef.current + extraAngleRef.current

    // whole-ring fade (intro <-> ring view). reduced motion = instant
    const revealGoal = shown ? 1 : 0
    revealRef.current = prefersReducedMotion
      ? revealGoal
      : THREE.MathUtils.damp(revealRef.current, revealGoal, ring.fadeSpeed, dt)
    group.visible = revealRef.current > 0.01

    projects.forEach((_project, i) => {
      const panel = panelRefs.current[i]
      if (!panel) return
      // where is this panel around the circle right now?
      // towardCamera: -1 = far side (behind her), +1 = right between the camera and her
      const angle = group.rotation.y - i * STEP
      const towardCamera = -Math.cos(angle)
      // smoothstep = a soft 0 to 1 ramp: 0 until -0.1, 1 from 0.55
      const blocking = THREE.MathUtils.smoothstep(towardCamera, -0.1, 0.55)
      presenceRef.current[i] = 1 - blocking

      panel.position.y = -blocking * ring.blockerSink // sink below the floor
      const opacity = revealRef.current * (1 - blocking)
      panel.visible = opacity > 0.01
      panel.traverse((object) => {
        if (object instanceof THREE.Mesh) object.material.opacity = opacity
      })
    })

    // tell her where the hovered panel is, so she can turn her head toward it
    const hovered = panelRefs.current[sceneState.hoveredIndex]
    if (hovered) hovered.localToWorld(sceneState.hoveredPosition.set(0, ring.panelY, -ring.radius))
  })

  return (
    <group ref={ringRef}>
      {projects.map((project, i) => (
        // minus sign: the next project waits on the right, so the spin brings them in order
        <group
          key={project.id}
          ref={(element) => {
            panelRefs.current[i] = element
          }}
          rotation={[0, -i * STEP, 0]}
          onPointerOver={(event) => {
            event.stopPropagation() // only the nearest panel counts
            // only real, visible panels in the ring view can be hovered
            if (sceneState.ringActive && presenceRef.current[i] > 0.5) sceneState.hoveredIndex = i
          }}
          onPointerOut={() => {
            if (sceneState.hoveredIndex === i) sceneState.hoveredIndex = -1
          }}
        >
          <ProjectPanel project={project} />
        </group>
      ))}
    </group>
  )
}
