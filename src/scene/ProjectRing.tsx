import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { projects } from '../data/projects'
import { colors, ring } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import { sceneState } from '../sceneState'
import ProjectPanel from './ProjectPanel'

// full circle (2 * PI radians = 360 degrees) split evenly between projects
const STEP = (Math.PI * 2) / projects.length

type Props = {
  shown: boolean // false fades the whole ring out (the intro), true fades it in
  openIndex: number // which panel is open (-1 = none)
  onOpen: (index: number) => void
}

// All project panels, spaced evenly in a circle around the character.
// The first project (leash) starts in front, facing the camera.
export default function ProjectRing({ shown, openIndex, onOpen }: Props) {
  // a ref = a direct handle to the real three.js object
  const ringRef = useRef<THREE.Group>(null)
  const panelRefs = useRef<(THREE.Group | null)[]>([]) // one handle per panel
  const burstRef = useRef<THREE.Group>(null) // the gold sparkle burst around an opened panel
  const revealRef = useRef(0) // whole-ring fade: starts invisible (the site opens on the intro)
  const autoAngleRef = useRef(0) // the slow spin it always does by itself
  const extraAngleRef = useRef(0) // the extra spin from scrolling and dragging
  const dimRef = useRef(1) // 1 = normal, dimmedOpacity = another panel is open
  // per panel, each from 0 to 1
  const presenceRef = useRef(projects.map(() => 1)) // 1 = there, 0 = faded out (in front of her)
  const hoverRef = useRef(projects.map(() => 0)) // 1 = lifted and glowing
  const openRef = useRef(projects.map(() => 0)) // 1 = flown to the front and flat
  const burstStartRef = useRef(-100) // clock time the last burst started
  const lastOpenRef = useRef(-1)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const group = ringRef.current
    if (!group) return
    // ease toward a goal (or jump there with reduced motion)
    const ease = (current: number, goal: number, speed: number) =>
      prefersReducedMotion ? goal : THREE.MathUtils.damp(current, goal, speed, dt)

    // spin: always slowly by itself, plus whatever scrolling and dragging add
    autoAngleRef.current += ring.spinSpeed * dt
    const extraGoal = sceneState.scrollScreens * ring.scrollTurn + sceneState.dragAngle
    extraAngleRef.current = ease(extraAngleRef.current, extraGoal, ring.spinEase)
    group.rotation.y = autoAngleRef.current + extraAngleRef.current
    group.updateMatrixWorld()

    // whole-ring fade (intro <-> ring view), and dimming while a panel is open
    revealRef.current = ease(revealRef.current, shown ? 1 : 0, ring.fadeSpeed)
    dimRef.current = ease(dimRef.current, openIndex >= 0 ? ring.dimmedOpacity : 1, ring.openSpeed)
    group.visible = revealRef.current > 0.01

    // the spot in front of the camera where an open panel goes (in the ring's own coordinates)
    const front = frontPose(state.camera as THREE.PerspectiveCamera, group)

    projects.forEach((_project, i) => {
      const panel = panelRefs.current[i]
      if (!panel) return

      // where is this panel around the circle right now?
      // towardCamera: -1 = far side (behind her), +1 = right between the camera and her
      const towardCamera = -Math.cos(group.rotation.y - i * STEP)
      // smoothstep = a soft 0 to 1 ramp: 0 until -0.1, 1 from 0.55
      const blocking = THREE.MathUtils.smoothstep(towardCamera, -0.1, 0.55)
      presenceRef.current[i] = 1 - blocking
      hoverRef.current[i] = ease(hoverRef.current[i], sceneState.hoveredIndex === i ? 1 : 0, 8)
      openRef.current[i] = ease(openRef.current[i], openIndex === i ? 1 : 0, ring.openSpeed)
      const open = openRef.current[i]
      const hover = hoverRef.current[i]

      // home: its place in the ring (sunk if it's in front of her, lifted if hovered)
      const homePosition = new THREE.Vector3(0, -blocking * ring.blockerSink + hover * ring.hoverLift, 0)
      const homeRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -i * STEP, 0))
      // glide between home and the front spot
      panel.position.lerpVectors(homePosition, front.position, open)
      panel.quaternion.slerpQuaternions(homeRotation, front.rotation, open)

      // see-through amount: ring fade x (not blocking, or open) x dimmed unless it's the open one
      const presence = THREE.MathUtils.lerp(1 - blocking, 1, open)
      const dim = THREE.MathUtils.lerp(dimRef.current, 1, open)
      const opacity = revealRef.current * presence * dim
      panel.visible = opacity > 0.01

      panel.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.material.opacity = opacity
        // flatten: blend toward the flat shape stored in the geometry (the morph target)
        if (!object.morphTargetInfluences) object.updateMorphTargets()
        if (object.morphTargetInfluences) object.morphTargetInfluences[0] = open
        // frame glows brighter on hover
        if (object.userData.role === 'frame') {
          object.material.emissiveIntensity = THREE.MathUtils.lerp(ring.frameGlow, ring.hoverFrameGlow, Math.max(hover, open))
        }
      })
    })

    // tell her where the hovered panel is, so she can turn her head toward it
    const hovered = panelRefs.current[sceneState.hoveredIndex]
    if (hovered) hovered.localToWorld(sceneState.hoveredPosition.set(0, ring.panelY, -ring.radius))

    // gold sparkle burst: starts when a panel opens, grows outward and disappears
    if (openIndex !== lastOpenRef.current) {
      if (openIndex >= 0) burstStartRef.current = state.clock.elapsedTime
      lastOpenRef.current = openIndex
    }
    const burst = burstRef.current
    if (burst) {
      const progress = (state.clock.elapsedTime - burstStartRef.current) / ring.burstSeconds
      burst.visible = openIndex >= 0 && progress < 1 && !prefersReducedMotion
      burst.position.copy(group.localToWorld(front.center.clone()))
      burst.quaternion.copy(state.camera.quaternion)
      burst.scale.setScalar(0.6 + progress * 0.8)
    }
  })

  // a click only counts if the mouse didn't move much (otherwise it was a drag)
  function handleClick(event: { delta: number; stopPropagation: () => void }, i: number) {
    event.stopPropagation()
    if (event.delta > 6) return
    if (sceneState.ringActive && openIndex < 0 && presenceRef.current[i] > 0.5) onOpen(i)
  }

  return (
    <>
      <group ref={ringRef}>
        {projects.map((project, i) => (
          <group
            key={project.id}
            ref={(element) => {
              panelRefs.current[i] = element
            }}
            onClick={(event) => handleClick(event, i)}
            onPointerOver={(event) => {
              event.stopPropagation() // only the nearest panel counts
              // only real, visible panels in the ring view can be hovered (and not while one is open)
              if (sceneState.ringActive && openIndex < 0 && presenceRef.current[i] > 0.5) {
                sceneState.hoveredIndex = i
                document.body.style.cursor = 'pointer'
              }
            }}
            onPointerOut={() => {
              if (sceneState.hoveredIndex === i) sceneState.hoveredIndex = -1
              document.body.style.cursor = ''
            }}
          >
            <ProjectPanel project={project} />
          </group>
        ))}
      </group>

      {/* the burst: a flat box of gold sparkles the size of the open panel */}
      <group ref={burstRef} visible={false}>
        <Sparkles count={50} scale={[ring.panelWidth * 1.3, ring.panelHeight * 1.4, 0.6]} size={5} speed={0.8} color={colors.goldBright} />
      </group>
    </>
  )
}

// Where an open panel floats: in front of the camera, a bit to the left (the card is on the right),
// facing the camera. Returned in the ring's own coordinates, because the panel lives inside the spinning ring.
function frontPose(camera: THREE.PerspectiveCamera, ringGroup: THREE.Group) {
  const distance = ring.openDistance
  const visibleHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const visibleWidth = visibleHeight * camera.aspect
  const forward = camera.getWorldDirection(new THREE.Vector3())
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
  // wide screens: move it left so the detail card fits on the right
  const sideways = camera.aspect > 1.2 ? -visibleWidth * 0.22 : 0
  const centerWorld = camera.position.clone().addScaledVector(forward, distance).addScaledVector(right, sideways)

  // the panel's middle sits at (0, panelY, -radius) inside its own group, so offset the group by that
  const middle = new THREE.Vector3(0, ring.panelY, -ring.radius).applyQuaternion(camera.quaternion)
  const groupWorld = centerWorld.clone().sub(middle)

  const ringRotationInverse = ringGroup.getWorldQuaternion(new THREE.Quaternion()).invert()
  return {
    position: ringGroup.worldToLocal(groupWorld),
    rotation: ringRotationInverse.multiply(camera.quaternion), // face the camera
    center: ringGroup.worldToLocal(centerWorld.clone()),
  }
}
