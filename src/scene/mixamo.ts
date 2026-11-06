import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import type { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'

// Retargets a Mixamo .fbx animation onto a VRM.
// Adapted from the official three-vrm example "loadMixamoAnimation" (MIT license).

// Mixamo bone name -> VRM bone name
const mixamoToVrm: Record<string, VRMHumanBoneName> = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',

  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',

  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',

  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
}

export async function loadMixamoAnimation(url: string, vrm: VRM) {
  const asset = await new FBXLoader().loadAsync(url)
  const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com') // Mixamo always uses this name
  if (!clip) throw new Error(`no Mixamo animation found in ${url}`)
  const isVrm0 = vrm.meta.metaVersion === '0' // old VRM files face the other way

  // hip movement scale: her hip height divided by the Mixamo skeleton's hip height
  const mixamoHips = asset.getObjectByName('mixamorigHips')
  const vrmHips = vrm.humanoid.getNormalizedBoneNode('hips')
  if (!mixamoHips || !vrmHips) throw new Error('hips bone missing')
  // measured inside her own space, so the scale in theme.ts doesn't count twice
  const vrmHipsHeight = vrm.scene.worldToLocal(vrmHips.getWorldPosition(new THREE.Vector3())).y
  const hipsScale = vrmHipsHeight / mixamoHips.position.y

  const tracks: THREE.KeyframeTrack[] = []
  const restRotationInverse = new THREE.Quaternion()
  const parentRestRotation = new THREE.Quaternion()
  const rotation = new THREE.Quaternion()

  for (const track of clip.tracks) {
    // a track name looks like "mixamorigLeftArm.quaternion"
    const [mixamoName, property] = track.name.split('.')
    const boneName = mixamoToVrm[mixamoName]
    const vrmNode = boneName ? vrm.humanoid.getNormalizedBoneNode(boneName) : null
    const mixamoNode = asset.getObjectByName(mixamoName)
    if (!vrmNode || !mixamoNode || !mixamoNode.parent) continue // a bone she doesn't have

    // the Mixamo bone's starting rotation (and its parent's), used to convert into her pose
    mixamoNode.getWorldQuaternion(restRotationInverse).invert()
    mixamoNode.parent.getWorldQuaternion(parentRestRotation)

    if (track instanceof THREE.QuaternionKeyframeTrack) {
      // rotations: 4 numbers per keyframe
      const values = track.values.slice()
      for (let i = 0; i < values.length; i += 4) {
        rotation.fromArray(values, i)
        rotation.premultiply(parentRestRotation).multiply(restRotationInverse)
        rotation.toArray(values, i)
        if (isVrm0) {
          values[i] = -values[i]
          values[i + 2] = -values[i + 2]
        }
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(`${vrmNode.name}.${property}`, track.times, values))
    } else if (boneName === 'hips' && property === 'position') {
      // hip movement: 3 numbers per keyframe (x, y, z), scaled to her size
      const values = track.values.map((v, i) => (isVrm0 && i % 3 !== 1 ? -v : v) * hipsScale)
      tracks.push(new THREE.VectorKeyframeTrack(`${vrmNode.name}.${property}`, track.times, values))
    }
  }

  return new THREE.AnimationClip('idle', clip.duration, tracks)
}
