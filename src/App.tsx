import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import World from './scene/World'
import Character from './scene/Character'
import ProjectRing from './scene/ProjectRing'
import CameraRig from './scene/CameraRig'
import Intro from './overlay/Intro'
import RingHud from './overlay/RingHud'
import Footer from './overlay/Footer'
import { cameraViews, colors, fonts } from './theme'
import './overlay/overlay.css'

// which screen we're on: the close-up intro, or the full ring
export type View = 'intro' | 'ring'

// theme.ts colors and fonts, handed to the CSS as --variables
const themeVariables = {
  '--background': colors.background,
  '--cherry-glow': colors.cherryGlow,
  '--gold': colors.gold,
  '--gold-bright': colors.goldBright,
  '--soft-white': colors.softWhite,
  '--rose-grey': colors.roseGrey,
  '--font-title': `'${fonts.title}'`,
  '--font-body': `'${fonts.body}'`,
} as CSSProperties

// App does layout only: the 3D canvas at the back, the HTML overlay on top.
export default function App() {
  const [view, setView] = useState<View>('intro')
  const appRef = useRef<HTMLDivElement>(null)

  // on the intro, pressing Enter (with nothing focused) or scrolling down also enters
  useEffect(() => {
    if (view !== 'intro') return
    function onKey(event: KeyboardEvent) {
      // if a link or button has focus, Enter already activates it. don't double up
      if (event.key === 'Enter' && event.target === document.body) setView('ring')
    }
    function onWheel(event: WheelEvent) {
      if (event.deltaY > 0) setView('ring')
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [view])

  return (
    <div ref={appRef} className="app" style={themeVariables}>
      <Canvas
        // the camera starts at the intro close-up. CameraRig moves it from there
        camera={{ position: [...cameraViews.intro.position], fov: 45 }}
        // dpr caps pixel density at 1.5x so integrated graphics stays smooth
        dpr={[1, 1.5]}
        // track the mouse over the whole page, even over the HTML text, so her eyes can follow it
        eventSource={appRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <World />
        <Character />
        <ProjectRing shown={view === 'ring'} />
        <CameraRig view={view} />
      </Canvas>

      <div className="overlay">
        <Intro shown={view === 'intro'} onEnter={() => setView('ring')} />
        <RingHud shown={view === 'ring'} onBack={() => setView('intro')} />
        <Footer />
      </div>
    </div>
  )
}
