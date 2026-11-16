import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { character } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import { loadMixamoAnimation } from './mixamo'
import { sceneState } from '../sceneState'
import { loadingState } from '../loadingState'
import {
  aimEyes,
  applyGesturePose,
  armsDown,
  breathe,
  newBlinkState,
  newGestureState,
  turnHead,
  updateBlink,
  updateGesture,
} from './characterLife'

// what she is doing right now (a tiny "state machine")
// loading: files still downloading, she's hidden. warmup: drawn tiny for a few frames so the
// graphics card prepares her shaders and textures before anyone sees her (no freeze when she appears)
type Phase = 'loading' | 'warmup' | 'walk' | 'fadeIn' | 'wave' | 'idle' | 'breathing'

type Animations = {
  mixer: THREE.AnimationMixer // plays and blends the clips
  walk: THREE.AnimationAction
  wave: THREE.AnimationAction
  idle: THREE.AnimationAction
  walkSpeed: number // world units per second, measured from walk.fbx so her feet don't slide
}

const ANIMATION_FILES = ['walk.fbx', 'wave.fbx', 'idle.fbx']
const FACING_RIGHT = Math.PI / 2 // turned 90 degrees: walking toward the right of the screen
const FALLBACK_WALK_SPEED = 1.2 // used only if walk.fbx turns out to have no forward motion
const WARMUP_FRAMES = 3 // frame 0: normal shaders, frame 1: see-through shaders (for the fade), frame 2: back to normal

// The real character: loads the .vrm, walks in, waves, idles, blinks, follows the mouse.
export default function VrmCharacter({ file }: { file: string }) {
  // load the file. the plugin teaches GLTFLoader to read the VRM parts (bones, face, physics)
  const gltf = useLoader(
    GLTFLoader,
    `${import.meta.env.BASE_URL}models/${file}`,
    (loader) => {
      loader.register((parser) => new VRMLoaderPlugin(parser))
    },
    (event) => loadingState.reportBytes(file, event.loaded), // feeds the loader's percentage
  )
  const vrm = prepareVrm(gltf)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  const walksIn = !prefersReducedMotion // reduced motion: no walk-in, no wave
  const bodyRef = useRef<THREE.Group>(null) // moves and turns her as a whole
  const animationsRef = useRef<Animations | null>(null) // null until she appears
  const loadedRef = useRef<Animations | null>(null) // the 3 animations, ready but waiting for the warmup to finish
  const slowRef = useRef(false) // true = loading took too long: skip the walk-in, fade in at her spot instead
  const phaseRef = useRef<Phase>('loading')
  const phaseTimeRef = useRef(0) // seconds since the current phase started
  const warmupFrameRef = useRef(0)
  const materialsRef = useRef<MaterialList | null>(null) // her materials, for the fade-in
  const blinkRef = useRef(newBlinkState())
  const gestureRef = useRef(newGestureState()) // the small actions she does while idling
  const gestureClockStartedRef = useRef(false)
  const headRef = useRef({ yaw: 0, pitch: 0 }) // the head's current mouse-follow turn
  const lookTarget = useMemo(() => new THREE.Object3D(), []) // invisible point her eyes look at

  function setPhase(phase: Phase) {
    phaseRef.current = phase
    phaseTimeRef.current = 0
  }

  // load the three animations once
  useEffect(() => {
    const controller = new AbortController() // stops a late load from touching a removed character
    armsDown(vrm) // so she's never in a T-pose while loading

    const url = (name: string) => `${import.meta.env.BASE_URL}animations/${name}`
    const materials = listMaterials(vrm)
    materialsRef.current = materials
    const compiled = precompileShaders(gl, scene, camera, vrm, materials) // runs while the animations get ready
    const animationFiles = Promise.allSettled([
      // true = strip root motion, walk in place. the last argument feeds the loader's percentage
      loadMixamoAnimation(url('walk.fbx'), vrm, true, (bytes) => loadingState.reportBytes('walk.fbx', bytes)),
      loadMixamoAnimation(url('wave.fbx'), vrm, false, (bytes) => loadingState.reportBytes('wave.fbx', bytes)),
      loadMixamoAnimation(url('idle.fbx'), vrm, false, (bytes) => loadingState.reportBytes('idle.fbx', bytes)),
    ])
    Promise.all([animationFiles, compiled]).then(([[walk, wave, idle]]) => {
      if (controller.signal.aborted) return

      if (walk.status !== 'fulfilled' || wave.status !== 'fulfilled' || idle.status !== 'fulfilled') {
        // any file missing or broken: say which, then stand at her spot and breathe
        ;[walk, wave, idle].forEach((result, i) => {
          if (result.status === 'rejected') {
            console.warn(`${ANIMATION_FILES[i]} failed to load, using the breathing pose:`, result.reason)
          }
        })
        loadedRef.current = null
        startWarmup()
        return
      }

      const mixer = new THREE.AnimationMixer(vrm.scene)
      const animations: Animations = {
        mixer,
        walk: mixer.clipAction(walk.value.clip),
        wave: mixer.clipAction(wave.value.clip),
        idle: mixer.clipAction(idle.value.clip),
        walkSpeed: walk.value.forwardSpeed * character.scale || FALLBACK_WALK_SPEED,
      }
      // the wave file is a short loop: play it a few times as one wave, then hold the last frame
      animations.wave.setLoop(THREE.LoopRepeat, character.waveRepeats)
      animations.wave.clampWhenFinished = true
      loadedRef.current = animations
      startWarmup()
    })

    function startWarmup() {
      // measured from the moment the page started loading
      slowRef.current = performance.now() > character.slowLoadSeconds * 1000
      warmupFrameRef.current = 0
      setPhase('warmup')
    }

    return () => {
      controller.abort()
      animationsRef.current?.mixer.stopAllAction()
      animationsRef.current = null
      loadedRef.current = null
    }
  }, [vrm, walksIn, gl, scene, camera])

  // the warmup is over: show her, and start the right entrance
  function appear(body: THREE.Group) {
    body.scale.setScalar(1)
    vrm.springBoneManager?.reset() // hair and cloth start calm, not swinging from the warmup
    const animations = loadedRef.current
    if (!animations) {
      // an animation file failed: stand at her spot and breathe
      body.position.set(0, 0, 0)
      body.rotation.set(0, 0, 0)
      setPhase('breathing')
    } else {
      animationsRef.current = animations
      if (walksIn && !slowRef.current) {
        // fast load: the walk-in from the left edge
        body.position.set(character.walkStartX, 0, 0)
        body.rotation.set(0, FACING_RIGHT, 0)
        animations.walk.play()
        setPhase('walk')
      } else if (walksIn) {
        // slow load: no walk-in. fade in already standing at her spot, then wave
        body.position.set(0, 0, 0)
        body.rotation.set(0, 0, 0)
        animations.idle.play()
        setSeeThrough(materialsRef.current, true, 0)
        setPhase('fadeIn')
      } else {
        // reduced motion: just standing at her spot with the idle
        body.position.set(0, 0, 0)
        body.rotation.set(0, 0, 0)
        animations.idle.play()
        setPhase('idle')
      }
    }
    loadingState.markShown()
    performance.mark('character-visible') // for measuring load time in the browser's performance tools
  }

  useFrame((state, delta) => {
    // cap delta: after switching browser tabs it can be huge and the hair physics would explode
    const dt = Math.min(delta, 0.1)
    const body = bodyRef.current
    if (!body) return
    phaseTimeRef.current += dt

    body.visible = phaseRef.current !== 'loading'
    if (phaseRef.current === 'loading') return
    if (phaseRef.current === 'warmup') {
      // drawn too small to see, so the graphics card compiles her shaders and uploads her textures now
      const frame = warmupFrameRef.current++
      if (frame === 0) body.scale.setScalar(0.0001)
      if (frame === 1 && slowRef.current) setSeeThrough(materialsRef.current, true) // the fade-in shaders too
      if (frame === 2) setSeeThrough(materialsRef.current, false)
      if (frame >= WARMUP_FRAMES) appear(body)
      vrm.update(dt)
      return
    }

    // fade-in after a slow load: from invisible to fully there, then blend into a wave
    if (phaseRef.current === 'fadeIn' && animationsRef.current) {
      const progress = Math.min(1, phaseTimeRef.current / character.fadeSeconds)
      setSeeThrough(materialsRef.current, progress < 1, progress)
      if (progress >= 1) {
        const { idle, wave } = animationsRef.current
        wave.reset().play()
        idle.crossFadeTo(wave, character.blendSeconds, false)
        setPhase('wave')
      }
    }
    const animations = animationsRef.current

    if (animations) {
      // walking: move her to the right. as the walk blends out, she slows down by herself
      if (body.position.x < 0) {
        const step = animations.walkSpeed * animations.walk.getEffectiveWeight() * dt
        body.position.x = Math.min(0, body.position.x + step)
      }
      // almost at her spot: blend walk into wave
      const distanceLeft = -body.position.x
      if (phaseRef.current === 'walk' && distanceLeft <= (animations.walkSpeed * character.blendSeconds) / 2) {
        animations.wave.reset().play()
        animations.walk.crossFadeTo(animations.wave, character.blendSeconds, false)
        setPhase('wave')
      }
      // wave almost over: blend into the idle loop (forever)
      const waveLength = animations.wave.getClip().duration * character.waveRepeats
      if (phaseRef.current === 'wave' && phaseTimeRef.current >= waveLength - character.blendSeconds) {
        animations.idle.reset().play()
        animations.wave.crossFadeTo(animations.idle, character.blendSeconds, false)
        setPhase('idle')
      }

      // idle: every 8 to 12 seconds a small natural action (not with reduced motion)
      let gestureProgress = -1
      if (phaseRef.current === 'idle' && !prefersReducedMotion) {
        const gesture = gestureRef.current
        if (!gestureClockStartedRef.current) {
          // the first gap counts from her first idle moment, not from page load
          // (after a slow load, an action would otherwise be overdue and fire right after her wave)
          gesture.nextAt += state.clock.elapsedTime
          gestureClockStartedRef.current = true
        }
        const before = gesture.kind
        gestureProgress = updateGesture(gesture, state.clock.elapsedTime)
        // the wave action uses wave.fbx: blend into it, and back to idle when it's over
        if (before !== 'wave' && gesture.kind === 'wave') {
          animations.wave.reset().play()
          animations.idle.crossFadeTo(animations.wave, 0.4, false)
        }
        if (before === 'wave' && gesture.kind !== 'wave') {
          animations.idle.reset().play()
          animations.wave.crossFadeTo(animations.idle, 0.4, false)
        }
      }
      // never frozen: if the idle somehow stopped (and she isn't mid-wave), start it again
      if (phaseRef.current === 'idle' && gestureRef.current.kind !== 'wave' && !animations.idle.isRunning()) {
        animations.idle.reset().play()
      }

      animations.mixer.update(dt) // pose the bones for this moment
      const kind = gestureRef.current.kind
      if (kind && gestureProgress >= 0) applyGesturePose(vrm, kind, gestureProgress)
    } else {
      breathe(vrm, state.clock.elapsedTime)
    }

    // turning: sideways while walking in, then smoothly toward the camera
    const walking = phaseRef.current === 'walk'
    body.rotation.y = THREE.MathUtils.damp(body.rotation.y, walking ? FACING_RIGHT : 0, character.turnSpeed, dt)

    // where should her head point? a hovered panel wins, otherwise the mouse (paused while walking in)
    const head = headRef.current
    const looking = !walking
    const hovering = looking && sceneState.hoveredIndex >= 0
    let goalYaw = looking ? state.pointer.x * character.headTurn : 0
    let goalPitch = looking ? state.pointer.y * character.headTilt : 0
    if (hovering) {
      // angle from her face (+z) to the panel, turned as far as a neck can (panels behind her = a glance to that side)
      const headNode = vrm.humanoid.getNormalizedBoneNode('head')
      const from = headNode ? headNode.getWorldPosition(new THREE.Vector3()) : body.position
      const { x, y, z } = sceneState.hoveredPosition
      const toPanel = new THREE.Vector3(x, y, z).sub(from)
      const angle = Math.atan2(toPanel.x, toPanel.z) - body.rotation.y
      goalYaw = THREE.MathUtils.clamp(angle, -character.hoverHeadTurn, character.hoverHeadTurn)
      goalPitch = 0
    }
    // damp = move a fraction of the way each frame, so it eases instead of snapping
    head.yaw = THREE.MathUtils.damp(head.yaw, goalYaw, 3, dt)
    head.pitch = THREE.MathUtils.damp(head.pitch, goalPitch, 3, dt)
    turnHead(vrm, head.yaw, head.pitch)

    if (looking) {
      // eyes: the hovered panel, or an invisible point at the camera nudged toward the mouse
      let goal: THREE.Vector3
      if (hovering) {
        const { x, y, z } = sceneState.hoveredPosition
        goal = new THREE.Vector3(x, y, z)
      } else {
        const camera = state.camera
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
        goal = camera.position.clone().addScaledVector(right, state.pointer.x * 0.6).addScaledVector(up, state.pointer.y * 0.4)
      }
      lookTarget.position.lerp(goal, 1 - Math.exp(-4 * dt))
      aimEyes(vrm, lookTarget)
    } else {
      aimEyes(vrm, null) // eyes straight ahead
    }

    updateBlink(vrm, blinkRef.current, state.clock.elapsedTime)
    vrm.update(dt) // copies the pose onto her mesh, applies face + eyes, runs hair/cloth physics
  })

  return (
    // hidden until the warmup is done. appear() then puts her where her entrance starts
    <group ref={bodyRef} visible={false}>
      {/* <primitive> puts an object three.js already made straight into the scene */}
      <primitive object={vrm.scene} scale={character.scale} />
    </group>
  )
}

// every material on her (each only once), with its original see-through setting
type MaterialList = Map<THREE.Material, boolean>
function listMaterials(vrm: VRM): MaterialList {
  const found: MaterialList = new Map()
  vrm.scene.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (mesh.isMesh) [mesh.material].flat().forEach((material) => found.set(material, material.transparent))
  })
  return found
}

// see-through on or off for all her materials (used only during the fade-in).
// "off" puts each material back to its own original setting
function setSeeThrough(materials: MaterialList | null, on: boolean, opacity = 1) {
  if (!materials) return
  for (const [material, original] of materials) {
    const transparent = on || original
    if (material.transparent !== transparent) {
      material.transparent = transparent
      material.needsUpdate = true // switches shaders (already prepared in the background)
    }
    material.opacity = opacity
  }
}

// Compiles her shaders in the background (the browser's parallel shader compile) while the animations
// get ready, so the page doesn't freeze for it. Compiled for an off-screen picture, like the one the
// effects draw into, so they are the exact shaders the real frames use. Two versions: normal, and
// see-through (for the fade-in).
function precompileShaders(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, vrm: VRM, materials: MaterialList) {
  const target = new THREE.WebGLRenderTarget(1, 1)
  const previous = gl.getRenderTarget()
  gl.setRenderTarget(target)
  const jobs = [gl.compileAsync(vrm.scene, camera, scene)]
  setSeeThrough(materials, true)
  jobs.push(gl.compileAsync(vrm.scene, camera, scene))
  setSeeThrough(materials, false)
  gl.setRenderTarget(previous)
  return Promise.all(jobs)
    .catch((error) => console.warn('shader precompile skipped, they will compile on first draw:', error))
    .finally(() => target.dispose())
}

// One-time cleanup after loading. The loader caches the file,
// so the "prepared" flag stops this from running twice on the same model.
function prepareVrm(gltf: GLTF): VRM {
  const vrm = gltf.userData.vrm as VRM
  if (!gltf.userData.prepared) {
    VRMUtils.removeUnnecessaryVertices(gltf.scene) // drop unused points (lighter)
    VRMUtils.combineSkeletons(gltf.scene) // share one skeleton between her meshes (lighter)
    VRMUtils.rotateVRM0(vrm) // only turns old VRM 0.x files around. yours is 1.0, so it does nothing
    // skinned meshes can be wrongly hidden when the camera thinks they're off screen
    vrm.scene.traverse((object) => {
      object.frustumCulled = false
    })
    gltf.userData.prepared = true
  }
  return vrm
}
