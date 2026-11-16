import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import World from './World'
import Character from './Character'
import ProjectRing from './ProjectRing'
import CameraRig from './CameraRig'
import Effects from './Effects'
import FrameDriver from './FrameDriver'
import AutoQuality, { type Quality } from './AutoQuality'
import { cameraViews, effects } from '../theme'
import type { View } from '../App'

type Props = {
  view: View
  openIndex: number
  onOpen: (index: number) => void
  eventSource: React.RefObject<HTMLElement>
}

// the screen's own pixel density, capped (1 to 1.25): more pixels than that cost too much on integrated graphics
const fullPixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), effects.maxPixelRatio)

// Everything 3D. App loads this file lazily (React.lazy), so three.js and friends download
// in their own file and the intro text and button appear before they arrive.
export default function Scene({ view, openIndex, onOpen, eventSource }: Props) {
  const [quality, setQuality] = useState<Quality>('high') // AutoQuality lowers it if the frame rate drops

  return (
    <Canvas
      // FrameDriver draws the frames itself: every frame normally, every other one while covered, none in a hidden tab
      frameloop="never"
      // the camera starts at the intro close-up. CameraRig moves it from there
      camera={{ position: [...cameraViews.intro.position], fov: 45 }}
      // dpr caps pixel density so integrated graphics stays smooth (the effects cost per pixel)
      // low quality (see AutoQuality) uses fewer pixels. AdaptiveDpr sets the same value, this keeps the two in step
      dpr={quality === 'high' ? fullPixelRatio : fullPixelRatio * effects.lowQualityPixelRatio}
      // track the mouse over the whole page, even over the HTML text, so her eyes can follow it
      eventSource={eventSource}
      eventPrefix="client"
    >
      <FrameDriver openIndex={openIndex} />
      <AutoQuality onChange={setQuality} />
      <World quality={quality} />
      <Character />
      <ProjectRing shown={view === 'ring'} openIndex={openIndex} onOpen={onOpen} />
      <CameraRig view={view} />
      <Effects quality={quality} />
    </Canvas>
  )
}
