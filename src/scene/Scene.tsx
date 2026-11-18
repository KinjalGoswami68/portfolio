import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import World from './World'
import Character from './Character'
import ProjectRing from './ProjectRing'
import CameraRig from './CameraRig'
import Effects from './Effects'
import { cameraViews, effects } from '../theme'
import type { View } from '../App'

type Props = {
  view: View
  openIndex: number
  onOpen: (index: number) => void
  eventSource: React.RefObject<HTMLElement>
}

// Everything 3D. App loads this file lazily (React.lazy), so three.js and friends download
// in their own file and the intro text and button appear before they arrive.
// The Canvas settings are the same as before: it draws every frame, at a fixed quality.
export default function Scene({ view, openIndex, onOpen, eventSource }: Props) {
  // changing the key throws the whole 3D scene away and builds it again on a new canvas (see watchContext)
  const [canvasKey, setCanvasKey] = useState(0)

  return (
    <Canvas
      key={canvasKey}
      onCreated={({ gl }) => watchContext(gl.domElement, () => setCanvasKey((key) => key + 1))}
      // the camera starts at the intro close-up. CameraRig moves it from there
      camera={{ position: [...cameraViews.intro.position], fov: 45 }}
      // dpr caps pixel density so integrated graphics stays smooth (the effects cost per pixel)
      dpr={[1, effects.maxPixelRatio]}
      // track the mouse over the whole page, even over the HTML text, so her eyes can follow it
      eventSource={eventSource}
      eventPrefix="client"
    >
      <World />
      <Character />
      <ProjectRing shown={view === 'ring'} openIndex={openIndex} onOpen={onOpen} />
      <CameraRig view={view} />
      <Effects />
    </Canvas>
  )
}

// The graphics card can take the 3D drawing surface away ("WebGL context lost"), for example when it
// runs out of memory or the driver resets. Without this the scene would stay broken.
// When the context comes back, or if it isn't back after 5 s, the whole scene is built again from scratch.
function watchContext(canvas: HTMLCanvasElement, rebuild: () => void) {
  let timer = 0
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault() // tells the browser we want the context back
      console.warn('WebGL context lost: rebuilding the 3D scene')
      timer = window.setTimeout(rebuild, 5000)
    },
    { once: true },
  )
  canvas.addEventListener(
    'webglcontextrestored',
    () => {
      clearTimeout(timer)
      rebuild()
    },
    { once: true },
  )
}
