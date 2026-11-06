import { colors } from '../theme'

// Placeholder character. Becomes a feminine placeholder + VRM loader in part E.
const radius = 0.4
const middleLength = 1.2
// total height = radius + middleLength + radius = 2
// a mesh's position is its center, so lift it by half its height to stand on the floor
const halfHeight = radius + middleLength / 2

export default function Character() {
  return (
    <mesh position={[0, halfHeight, 0]}>
      {/* args: [radius, middle length, cap smoothness, roundness] */}
      <capsuleGeometry args={[radius, middleLength, 8, 16]} />
      {/* "standard" material reacts to lights, so it gets shading */}
      <meshStandardMaterial color={colors.roseGrey} roughness={0.6} />
    </mesh>
  )
}
