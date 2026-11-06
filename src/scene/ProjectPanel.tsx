import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import type { Project } from '../data/projects'
import { colors, ring } from '../theme'
import { coverCrop, loadPanelFonts, makePlaceholderTexture } from './panelTexture'

// One curved project panel with a thin gold frame and a dark back.
// It's a slice of a big cylinder centered on the character, sitting behind her (the -z side).
// ProjectRing rotates copies of it into a circle, and animates hover, flattening and flying.
// userData.role tags each mesh so ProjectRing can find the frame and the picture.
export default function ProjectPanel({ project }: { project: Project }) {
  // build the curved shapes once (useMemo = don't rebuild on every re-render)
  const pictureGeometry = useMemo(
    () => makeCurvedGeometry(ring.radius, ring.panelWidth, ring.panelHeight),
    [],
  )
  // the frame: a slightly bigger slice just behind the picture. only its edge peeks out
  const frameGeometry = useMemo(
    () =>
      makeCurvedGeometry(
        ring.radius + 0.03,
        ring.panelWidth + ring.frameThickness * 2,
        ring.panelHeight + ring.frameThickness * 2,
      ),
    [],
  )
  const texture = usePanelTexture(project)

  return (
    <group position={[0, ring.panelY, 0]}>
      {/* gold frame: only its inside is drawn (BackSide), so only the thin border shows */}
      <mesh geometry={frameGeometry} userData={{ role: 'frame' }}>
        <meshStandardMaterial
          color={colors.gold}
          metalness={0.6}
          roughness={0.35}
          emissive={colors.gold}
          emissiveIntensity={ring.frameGlow}
          side={THREE.BackSide}
          transparent // lets ProjectRing fade it in and out
        />
      </mesh>
      {/* the panel's back: the outside of the same shape, dark (FrontSide = outside only) */}
      <mesh geometry={frameGeometry} userData={{ role: 'back' }}>
        <meshStandardMaterial color={colors.background} roughness={0.9} side={THREE.FrontSide} transparent />
      </mesh>

      {/* the picture, on the inside of the curve (BackSide), once its texture is ready */}
      {/* renderOrder 1 = drawn after the frame, so the see-through fade layers correctly */}
      {texture && (
        <mesh geometry={pictureGeometry} renderOrder={1} userData={{ role: 'picture' }}>
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture} // glow with the picture's own colors...
            emissive="#ffffff" // ...white here means "don't tint the glow"
            emissiveIntensity={ring.panelEmission}
            roughness={0.6}
            side={THREE.BackSide}
            toneMapped={false} // show the picture's true colors
            transparent // lets ProjectRing fade it in and out
          />
        </mesh>
      )}
    </group>
  )
}

// Tries to load public/projects/<image>. If it isn't there yet, draws a placeholder card.
function usePanelTexture(project: Project) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false // stops a late load from updating a removed panel
    const url = `${import.meta.env.BASE_URL}projects/${project.image}` // BASE_URL keeps it working on GitHub Pages
    new THREE.TextureLoader().load(
      url,
      (photo) => {
        // screenshot found
        if (cancelled) return
        photo.colorSpace = THREE.SRGBColorSpace
        coverCrop(photo, ring.panelWidth / ring.panelHeight)
        setTexture(photo)
      },
      undefined,
      () => {
        // no screenshot yet: wait for fonts, then paint the placeholder
        loadPanelFonts().then(() => {
          if (!cancelled) setTexture(makePlaceholderTexture(project))
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [project])

  return texture
}

// A curved slice of an open cylinder, centered behind the character,
// plus a "flat" version of the same points (a morph target) used when the panel opens.
function makeCurvedGeometry(radius: number, width: number, height: number) {
  // angle (in radians) the panel covers = arc length / radius
  const arc = width / radius
  const geometry = new THREE.CylinderGeometry(
    radius, // radius at the top
    radius, // radius at the bottom (same = straight wall, not a cone)
    height,
    24, // segments around the curve (more = smoother bend)
    1, // segments top to bottom
    true, // openEnded: no lids on top and bottom
    Math.PI - arc / 2, // where the slice starts. Math.PI = behind the character
    arc, // how wide the slice is
  )

  // the cylinder's picture is printed for viewing from OUTSIDE.
  // we look from INSIDE, so flip it left-to-right (u becomes 1 - u).
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) {
    uv.setX(i, 1 - uv.getX(i))
  }

  // the flat shape: unroll the curve. each point keeps its distance along the arc and its height,
  // and moves onto one flat wall at depth -radius
  const curved = geometry.attributes.position
  const flat = new Float32Array(curved.count * 3)
  for (let i = 0; i < curved.count; i++) {
    let angle = Math.atan2(curved.getX(i), curved.getZ(i)) // where this point sits around the circle
    if (angle < 0) angle += Math.PI * 2 // keep it near Math.PI, no jump from -PI to PI
    flat[i * 3] = -(angle - Math.PI) * radius // distance along the arc becomes sideways position
    flat[i * 3 + 1] = curved.getY(i)
    flat[i * 3 + 2] = -radius
  }
  geometry.morphAttributes.position = [new THREE.BufferAttribute(flat, 3)]
  return geometry
}
