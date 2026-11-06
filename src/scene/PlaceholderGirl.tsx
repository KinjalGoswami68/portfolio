import { character, colors } from '../theme'

// A simple feminine silhouette made of basic shapes, like a mannequin.
// Shown while the VRM downloads, or always if Character.tsx has MODEL_FILE = null.
export default function PlaceholderGirl() {
  return (
    <group scale={character.scale}>
      {/* head. args: [radius, width segments, height segments] */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.11, 16, 12]} />
        <meshStandardMaterial color={colors.roseGrey} roughness={0.6} />
      </mesh>
      {/* torso: a cylinder narrower at the waist. args: [top radius, bottom radius, height, segments] */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.13, 0.08, 0.45, 16]} />
        <meshStandardMaterial color={colors.roseGrey} roughness={0.6} />
      </mesh>
      {/* skirt: narrow at the waist, wide at the hem */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.32, 0.5, 24]} />
        <meshStandardMaterial color={colors.cherry} roughness={0.6} />
      </mesh>
      {/* legs */}
      <mesh position={[-0.07, 0.2, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={colors.roseGrey} roughness={0.6} />
      </mesh>
      <mesh position={[0.07, 0.2, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={colors.roseGrey} roughness={0.6} />
      </mesh>
    </group>
  )
}
