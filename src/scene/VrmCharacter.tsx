import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { character } from '../theme'
import { prefersReducedMotion } from '../reducedMotion'
import { loadMixamoAnimation } from './mixamo'
import { aimEyes, armsDown, breathe, newBlinkState, turnHead, updateBlink } from './characterLife'

// what she is doing right now (a tiny "state machine")
type Phase = 'loading' | 'walk' | 'wave' | 'idle' | 'breathing'

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

// The real character: loads the .vrm, walks in, waves, idles, blinks, follows the mouse.
export default function VrmCharacter({ file }: { file: string }) {
  // load the file. the plugin teaches GLTFLoader to read the VRM parts (bones, face, physics)
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/${file}`, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  })
  const vrm = prepareVrm(gltf)

  const walksIn = !prefersReducedMotion // reduced motion: no walk-in, no wave
  const bodyRef = useRef<THREE.Group>(null) // moves and turns her as a whole
  const animationsRef = useRef<Animations | null>(null) // null until all 3 files have loaded
  const phaseRef = useRef<Phase>('loading')
  const phaseTimeRef = useRef(0) // seconds since the current phase started
  const blinkRef = useRef(newBlinkState())
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
    Promise.allSettled([
      loadMixamoAnimation(url('walk.fbx'), vrm, true), // true = strip root motion, walk in place
      loadMixamoAnimation(url('wave.fbx'), vrm),
      loadMixamoAnimation(url('idle.fbx'), vrm),
    ]).then(([walk, wave, idle]) => {
      if (controller.signal.aborted) return

      if (walk.status !== 'fulfilled' || wave.status !== 'fulfilled' || idle.status !== 'fulfilled') {
        // any file missing or broken: say which, then stand at her spot and breathe
        ;[walk, wave, idle].forEach((result, i) => {
          if (result.status === 'rejected') {
            console.warn(`${ANIMATION_FILES[i]} failed to load, using the breathing pose:`, result.reason)
          }
        })
        bodyRef.current?.position.set(0, 0, 0)
        bodyRef.current?.rotation.set(0, 0, 0)
        setPhase('breathing')
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
      animationsRef.current = animations

      if (walksIn) {
        animations.walk.play()
        setPhase('walk')
      } else {
        animations.idle.play()
        setPhase('idle')
      }
    })

    return () => {
      controller.abort()
      animationsRef.current?.mixer.stopAllAction()
      animationsRef.current = null
    }
  }, [vrm, walksIn])

  useFrame((state, delta) => {
    // cap delta: after switching browser tabs it can be huge and the hair physics would explode
    const dt = Math.min(delta, 0.1)
    const body = bodyRef.current
    if (!body) return
    phaseTimeRef.current += dt
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
      animations.mixer.update(dt) // pose the bones for this moment
    } else {
      breathe(vrm, state.clock.elapsedTime)
    }

    // turning: sideways while walking in, then smoothly toward the camera
    const walking = phaseRef.current === 'walk' || (phaseRef.current === 'loading' && walksIn)
    body.rotation.y = THREE.MathUtils.damp(body.rotation.y, walking ? FACING_RIGHT : 0, character.turnSpeed, dt)

    // head and eyes follow the mouse softly (paused while walking in)
    const head = headRef.current
    const looking = !walking && phaseRef.current !== 'loading'
    // damp = move a fraction of the way each frame, so it eases instead of snapping
    head.yaw = THREE.MathUtils.damp(head.yaw, looking ? state.pointer.x * character.headTurn : 0, 3, dt)
    head.pitch = THREE.MathUtils.damp(head.pitch, looking ? state.pointer.y * character.headTilt : 0, 3, dt)
    turnHead(vrm, head.yaw, head.pitch)

    if (looking) {
      // eyes: an invisible point at the camera, nudged a little toward the mouse
      const camera = state.camera
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
      const goal = camera.position.clone().addScaledVector(right, state.pointer.x * 0.6).addScaledVector(up, state.pointer.y * 0.4)
      lookTarget.position.lerp(goal, 1 - Math.exp(-4 * dt))
      aimEyes(vrm, lookTarget)
    } else {
      aimEyes(vrm, null) // eyes straight ahead
    }

    updateBlink(vrm, blinkRef.current, state.clock.elapsedTime)
    vrm.update(dt) // copies the pose onto her mesh, applies face + eyes, runs hair/cloth physics
  })

  return (
    // start off the left edge, facing right (or at her spot, facing the camera, with reduced motion)
    <group
      ref={bodyRef}
      position={[walksIn ? character.walkStartX : 0, 0, 0]}
      rotation={[0, walksIn ? FACING_RIGHT : 0, 0]}
    >
      {/* <primitive> puts an object three.js already made straight into the scene */}
      <primitive object={vrm.scene} scale={character.scale} />
    </group>
  )
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
