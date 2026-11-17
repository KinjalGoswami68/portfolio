import { useMemo } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial, Sparkles, Stars } from '@react-three/drei'
import { colors, world } from '../theme'

// brighter than "normal" colors, so bloom picks them up (see effects in theme.ts)
const glowColor = new THREE.Color(colors.cherryGlow).multiplyScalar(world.glowBoost)
const sparkleColor = new THREE.Color(colors.goldBright).multiplyScalar(world.sparkleBoost)

// The environment: background, fog, stars, glossy floor, center glow, lights, dust.
export default function World() {
  // the soft round glow picture, painted once
  const glowTexture = useMemo(() => makeGlowTexture(), [])

  return (
    <>
      {/* paints the whole scene background (like a backdrop on a stage) */}
      <color attach="background" args={[colors.background]} />

      {/* fog: things fade into the background color as they get farther away */}
      <fog attach="fog" args={[colors.background, world.fogNear, world.fogFar]} />

      {/* faint stars far away */}
      <Stars radius={60} depth={40} count={world.starCount} factor={3} saturation={0} fade speed={0.3} />

      {/* glossy floor: a dark maroon mirror with blurred reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[world.floorRadius, 64]} />
        <MeshReflectorMaterial
          color={colors.maroon}
          metalness={0.4}
          roughness={0.8}
          resolution={world.reflectionResolution} // size of the hidden reflection picture
          blur={[300, 100]} // how soft the reflection is (sideways, depth)
          mixBlur={1}
          mixStrength={world.reflectionStrength} // how visible the reflection is
          depthScale={1.2} // reflections blur more the farther they are from the floor
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
        />
      </mesh>

      {/* cherry glow on the floor under the character */}
      {/* position y 0.01 = a hair above the floor so the two don't flicker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[world.glowRadius, 64]} />
        <meshBasicMaterial
          map={glowTexture}
          color={glowColor} // brighter than "normal" cherry, so bloom makes it glow
          transparent
          blending={THREE.AdditiveBlending} // adds light on top, like a flashlight
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* lights */}
      {/* ambient = soft light from everywhere, so nothing is pitch black */}
      <ambientLight intensity={0.25} />
      {/* directional = sun-like light from one direction (lights the character and frames) */}
      <directionalLight position={[3, 6, 4]} intensity={1} />
      {/* point light = a bulb. low at the center, it gives the floor a glossy cherry hotspot */}
      <pointLight position={[0, 0.6, 0]} color={colors.cherryGlow} intensity={4} distance={6} />

      {/* slow floating dust in the air */}
      <Sparkles
        count={world.dustCount}
        scale={[14, 5, 14]} // the box the dust floats in (width, height, depth)
        position={[0, 2.5, 0]}
        size={world.dustSize}
        speed={0.2}
        opacity={0.4}
        noise={1}
        color={colors.gold}
      />
      {/* gold dust drifting around the ring: a wide, flat band at panel height */}
      <Sparkles
        count={world.ringDustCount}
        scale={[17, 2.5, 17]}
        position={[0, 1.4, 0]}
        size={world.ringDustSize}
        speed={0.25}
        opacity={0.7}
        noise={1.5}
        color={sparkleColor}
      />
      {/* a few sparkles close around her */}
      <Sparkles
        count={world.herSparkleCount}
        scale={[1.6, 2.2, 1.6]}
        position={[0, 1.1, 0]}
        size={world.herSparkleSize}
        speed={0.35}
        opacity={0.8}
        color={sparkleColor}
      />
    </>
  )
}

// A white circle that fades to transparent at the edge, drawn on a hidden 2D canvas.
function makeGlowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
