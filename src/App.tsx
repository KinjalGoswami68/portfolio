import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import World from './scene/World'
import Character from './scene/Character'
import ProjectRing from './scene/ProjectRing'
import CameraRig from './scene/CameraRig'
import Effects from './scene/Effects'
import Intro from './overlay/Intro'
import RingHud from './overlay/RingHud'
import Footer from './overlay/Footer'
import ProjectDetail from './overlay/ProjectDetail'
import Chapters from './overlay/Chapters'
import { projects } from './data/projects'
import { cameraViews, colors, effects, fonts, ring } from './theme'
import { sceneState } from './sceneState'
import * as THREE from 'three'
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

// #leash in the address bar -> the index of that project (-1 if none)
function projectIndexFromHash() {
  const id = window.location.hash.slice(1)
  return projects.findIndex((project) => project.id === id)
}

// App does layout only: the 3D canvas at the back, the HTML overlay on top.
export default function App() {
  // a link with #leash skips the intro and opens that project straight away
  const [openIndex, setOpenIndex] = useState(projectIndexFromHash) // which project is open (-1 = none)
  const [view, setView] = useState<View>(() => (projectIndexFromHash() >= 0 ? 'ring' : 'intro'))
  const appRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number } | null>(null) // last pointer spot while dragging, null = not dragging
  const [inChapters, setInChapters] = useState(false) // scrolled down into the chapters?

  // tell the 3D side which view we're in. leaving the ring: reset scroll and hover
  useEffect(() => {
    sceneState.ringActive = view === 'ring'
    if (view === 'intro') {
      sceneState.hoveredIndex = -1
      sceneState.scrollScreens = 0
      sceneState.chapterProgress = 0
      sceneState.orbitYaw = 0 // next time you enter, the ring view starts from the default angle
      sceneState.orbitPitch = 0
      scrollerRef.current?.scrollTo({ top: 0 })
    }
  }, [view])

  // open / close a project, and keep the address bar's #hash in step
  function openProject(index: number) {
    setView('ring')
    setOpenIndex(index)
    sceneState.hoveredIndex = -1
    document.body.style.cursor = ''
    window.history.replaceState(null, '', `#${projects[index].id}`)
  }
  function closeProject() {
    setOpenIndex(-1)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  function backToIntro() {
    closeProject()
    setInChapters(false)
    setView('intro')
  }

  // someone edits the #hash by hand (or uses back/forward): follow it
  useEffect(() => {
    function onHashChange() {
      const index = projectIndexFromHash()
      if (index >= 0) setView('ring')
      setOpenIndex(index)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // the free camera only exists in the ring view, and not while a project is open
  const canOrbit = view === 'ring' && openIndex < 0
  // pressing a link or button, or on a chapter card (you might be selecting text), isn't a drag
  const isOnHtml = (target: EventTarget) => target instanceof Element && target.closest('a, button, .chapter') !== null

  // dragging in the ring view orbits the camera around her (CameraRig does the moving)
  function onPointerDown(event: React.PointerEvent) {
    if (!canOrbit || event.button !== 0 || isOnHtml(event.target)) return
    dragRef.current = { x: event.clientX, y: event.clientY }
    // keep getting the moves even if the mouse leaves the window mid-drag
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function onPointerMove(event: React.PointerEvent) {
    const last = dragRef.current
    if (!last || !canOrbit) return
    const { orbit } = cameraViews
    // drag right: the camera swings left around her (like turning the scene with your hand)
    sceneState.orbitYaw -= (event.clientX - last.x) * orbit.yawPerPixel
    // drag down: the camera rises. clamped so it never dips under the floor or goes top-down
    const tilted = sceneState.orbitPitch + (event.clientY - last.y) * orbit.pitchPerPixel
    sceneState.orbitPitch = THREE.MathUtils.clamp(tilted, orbit.minPitch, orbit.maxPitch)
    sceneState.lastOrbitDragAt = performance.now() // restarts the 3 second glide-back timer
    dragRef.current = { x: event.clientX, y: event.clientY }
  }
  function onPointerUp() {
    dragRef.current = null
  }
  // double-click: straight back to the default angle, no glide
  function onDoubleClick(event: React.MouseEvent) {
    if (!canOrbit || isOnHtml(event.target)) return
    sceneState.orbitYaw = 0
    sceneState.orbitPitch = 0
    sceneState.orbitSnap = true
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
        // dpr caps pixel density so integrated graphics stays smooth (the effects cost per pixel)
        dpr={[1, effects.maxPixelRatio]}
        // track the mouse over the whole page, even over the HTML text, so her eyes can follow it
        eventSource={appRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <World />
        <Character />
        <ProjectRing shown={view === 'ring'} openIndex={openIndex} onOpen={openProject} />
        <CameraRig view={view} />
        <Effects />
      </Canvas>

      {/* the scrolling layer: in the ring view, scrolling it spins the ring and dragging it orbits the camera.
          it's see-through, and mouse events still reach the 3D through eventSource */}
      <div
        ref={scrollerRef}
        className={`scroller ${view === 'ring' ? 'can-scroll' : ''}`}
        onScroll={(event) => {
          const element = event.currentTarget
          const screen = element.clientHeight
          sceneState.scrollScreens = element.scrollTop / screen
          // the chapters start coming up from the bottom once the ring zone is scrolled past
          const chaptersStart = (ring.scrollScreens - 1) * screen
          const scrollable = element.scrollHeight - screen - chaptersStart
          const progress = (element.scrollTop - chaptersStart) / Math.max(scrollable, 1)
          sceneState.chapterProgress = THREE.MathUtils.clamp(progress, 0, 1)
          setInChapters(progress > 0.02) // React skips the redraw if it didn't change
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        <div className="ring-zone" style={{ height: `${ring.scrollScreens * 100}%` }} />
        {/* the chapters, below the ring zone. only in the ring view */}
        <div inert={view !== 'ring'}>
          <Chapters onOpen={openProject} />
        </div>
      </div>

      <div className="overlay">
        <Intro shown={view === 'intro'} onEnter={() => setView('ring')} />
        <RingHud shown={view === 'ring'} inChapters={inChapters} onBack={backToIntro} onOpen={openProject} />
        <Footer />
        <ProjectDetail project={openIndex >= 0 ? projects[openIndex] : null} onClose={closeProject} />
      </div>
    </div>
  )
}
