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
export default function Scene({ view, openIndex, onOpen, eventSource }: Props) {
  return (
    <Canvas
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
