import { Stars } from '@react-three/drei'
import { colors, sizes } from '../theme'

// The environment: background color, stars, floor, lights.
export default function World() {
  return (
    <>
      {/* paints the whole scene background (like a backdrop on a stage) */}
      <color attach="background" args={[colors.background]} />

      {/* thousands of dots on a big sphere around us */}
      <Stars radius={60} depth={40} count={sizes.starCount} factor={4} fade speed={0.5} />

      {/* the floor: a flat disc, tipped -90 degrees so it lies down */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        {/* args: [radius, segments]. more segments = rounder edge */}
        <circleGeometry args={[sizes.floorRadius, 64]} />
        {/* "basic" material ignores lights, so it looks self-lit */}
        <meshBasicMaterial color={colors.floor} />
      </mesh>

      {/* lights: these only affect "standard" materials, like the capsule */}
      {/* ambient = soft light from everywhere, so nothing is pitch black */}
      <ambientLight intensity={0.4} />
      {/* directional = sun-like light from one direction */}
      <directionalLight position={[3, 6, 4]} intensity={1.2} />
      {/* a faint red glow coming up from the floor onto the character */}
      <pointLight position={[0, 0.5, 0]} color={colors.floor} intensity={3} distance={5} />
    </>
  )
}
