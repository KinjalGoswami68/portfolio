import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import World from './scene/World'
import Character from './scene/Character'
import ProjectRing from './scene/ProjectRing'
import CameraRig from './scene/CameraRig'
import Intro from './overlay/Intro'
import RingHud from './overlay/RingHud'
import Footer from './overlay/Footer'
import { cameraViews, colors, fonts, ring } from './theme'
import { sceneState } from './sceneState'
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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<number | null>(null) // last pointer x while dragging, null = not dragging

  // tell the 3D side which view we're in. leaving the ring: reset scroll and hover
  useEffect(() => {
    sceneState.ringActive = view === 'ring'
    if (view === 'intro') {
      sceneState.hoveredIndex = -1
      sceneState.scrollScreens = 0
      scrollerRef.current?.scrollTo({ top: 0 })
    }
  }, [view])

  // dragging sideways in the ring view spins the ring
  function onPointerDown(event: React.PointerEvent) {
    if (view === 'ring' && event.button === 0) dragRef.current = event.clientX
  }
  function onPointerMove(event: React.PointerEvent) {
    if (dragRef.current === null) return
    // minus: drag right and the panels you're looking at follow your hand to the right
    sceneState.dragAngle -= (event.clientX - dragRef.current) * ring.dragTurn
    dragRef.current = event.clientX
  }
  function onPointerUp() {
    dragRef.current = null
  }

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

      {/* the scrolling layer: in the ring view, scrolling it spins the ring.
          it's see-through, and mouse events still reach the 3D through eventSource */}
      <div
        ref={scrollerRef}
        className={`scroller ${view === 'ring' ? 'can-scroll' : ''}`}
        onScroll={(event) => {
          const element = event.currentTarget
          sceneState.scrollScreens = element.scrollTop / element.clientHeight
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div className="ring-zone" style={{ height: `${ring.scrollScreens * 100}%` }} />
      </div>

      <div className="overlay">
        <Intro shown={view === 'intro'} onEnter={() => setView('ring')} />
        <RingHud shown={view === 'ring'} onBack={() => setView('intro')} />
        <Footer />
      </div>
    </div>
  )
}
