import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import type { Project } from '../data/projects'
import { colors, ring } from '../theme'
import { makePlaceholderTexture } from './placeholderTexture'

type Props = {
  project: Project
  index: number // position in the list, used to pick a placeholder color
}

// One curved project panel: a thin slice of a big cylinder centered on the character.
// It sits behind the character (the -z side). ProjectRing rotates copies into a circle.
export default function ProjectPanel({ project, index }: Props) {
  // build the curved shape once (useMemo = don't rebuild on every re-render)
  const geometry = useMemo(() => makeCurvedGeometry(), [])

  return (
    <group position={[0, ring.panelY, 0]}>
      {/* inner face: the picture, facing the character */}
      <mesh geometry={geometry}>
        {project.image ? (
          <ImageMaterial file={project.image} />
        ) : (
          <PlaceholderMaterial title={project.title} index={index} />
        )}
      </mesh>
      {/* outer face: a plain dark back */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color={colors.panelBack} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

function makeCurvedGeometry() {
  // angle (in radians) the panel covers = arc length / radius
  const arc = ring.panelWidth / ring.radius
  const geometry = new THREE.CylinderGeometry(
    ring.radius, // radius at the top
    ring.radius, // radius at the bottom (same = straight wall, not a cone)
    ring.panelHeight,
    24, // segments around the curve (more = smoother bend)
    1, // segments top to bottom (1 is enough for a flat-tall wall)
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
  return geometry
}

// Real screenshot from public/projects/.
// BASE_URL keeps the path working later on GitHub Pages.
function ImageMaterial({ file }: { file: string }) {
  const texture = useTexture(`${import.meta.env.BASE_URL}projects/${file}`)
  // BackSide = draw on the inside of the curve
  // toneMapped false = show the picture's true colors, no extra color grading
  return <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
}

// Colored card with the title, until the screenshot exists.
function PlaceholderMaterial({ title, index }: { title: string; index: number }) {
  const background = colors.placeholders[index % colors.placeholders.length]
  // paint the texture once, not on every re-render
  const texture = useMemo(
    () => makePlaceholderTexture(title, background, colors.placeholderText),
    [title, background],
  )
  return <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
}
