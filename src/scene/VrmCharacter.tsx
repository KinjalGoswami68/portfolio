import { useEffect, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { character } from '../theme'
import { loadMixamoAnimation } from './mixamo'

// The real character: loads the .vrm, plays the Mixamo idle, runs hair/cloth physics.
export default function VrmCharacter({ file }: { file: string }) {
  // load the file. the plugin teaches GLTFLoader to read the VRM parts (bones, materials, physics)
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/${file}`, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  })
  const vrm = prepareVrm(gltf)

  // the animation player. stays null until the idle animation has loaded
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)

  useEffect(() => {
    // a "cancel" switch: stops a late load from touching a removed character
    const controller = new AbortController()
    armsDown(vrm) // so she isn't in a T-pose while the animation loads (or if it's missing)

    loadMixamoAnimation(`${import.meta.env.BASE_URL}animations/${character.idleAnimation}`, vrm)
      .then((clip) => {
        if (controller.signal.aborted) return
        const mixer = new THREE.AnimationMixer(vrm.scene)
        mixer.clipAction(clip).play() // loops forever by default
        mixerRef.current = mixer
      })
      .catch((error) => {
        // no idle.fbx yet: she keeps the arms-down pose and breathes
        console.info('idle animation not loaded, using the breathing pose:', error)
      })

    return () => {
      controller.abort()
      mixerRef.current?.stopAllAction()
      mixerRef.current = null
    }
  }, [vrm])

  useFrame((state, delta) => {
    // cap delta: after switching browser tabs it can be huge and the hair physics would explode
    const dt = Math.min(delta, 0.1)
    if (mixerRef.current) {
      mixerRef.current.update(dt) // move the bones to this moment of the animation
    } else {
      breathe(vrm, state.clock.elapsedTime)
    }
    vrm.update(dt) // copies the bone pose onto the mesh and runs spring-bone physics
  })

  // <primitive> puts an object three.js already made straight into the scene
  return <primitive object={vrm.scene} scale={character.scale} />
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

// Lowers both arms from the T-pose to her sides (angles in radians, about 70 degrees).
function armsDown(vrm: VRM) {
  const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm')
  const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm')
  if (leftArm) leftArm.rotation.z = -1.2
  if (rightArm) rightArm.rotation.z = 1.2
}

// Tiny chest rise and fall plus a slow sway, used only when there's no idle animation.
function breathe(vrm: VRM, time: number) {
  const chest = vrm.humanoid.getNormalizedBoneNode('chest')
  const spine = vrm.humanoid.getNormalizedBoneNode('spine')
  if (chest) chest.rotation.x = Math.sin(time * 1.6) * 0.02
  if (spine) spine.rotation.z = Math.sin(time * 0.5) * 0.015
}
