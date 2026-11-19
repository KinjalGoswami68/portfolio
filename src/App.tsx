import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import Intro from './overlay/Intro'
import RingHud from './overlay/RingHud'
import Footer from './overlay/Footer'
import ProjectDetail from './overlay/ProjectDetail'
import Chapters from './overlay/Chapters'
import FpsCounter from './overlay/FpsCounter'
import { projects } from './data/projects'
import { cameraViews, colors, fonts, ring } from './theme'
import { sceneState } from './sceneState'
import { prefersReducedMotion } from './reducedMotion'
import './overlay/overlay.css'

// the 3D scene (three.js and friends) arrives in its own file, after the intro is already on screen
const Scene = lazy(() => import('./scene/Scene'))

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

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

// #leash in the address bar -> the index of that project (-1 if none). old ids (#sentinelai) still work
function projectIndexFromHash() {
  const id = window.location.hash.slice(1)
  return projects.findIndex((project) => project.id === id || project.oldIds?.includes(id))
}

// App does layout only: the 3D canvas at the back, the HTML overlay on top.
export default function App() {
  // a link with #leash skips the intro and opens that project straight away
  const [openIndex, setOpenIndex] = useState(projectIndexFromHash) // which project is open (-1 = none)
  const [view, setView] = useState<View>(() => (projectIndexFromHash() >= 0 ? 'ring' : 'intro'))
  const appRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number } | null>(null) // last pointer spot while dragging, null = not dragging
  const [chaptersInView, setChaptersInView] = useState(false) // true once the first chapter has come up onto the screen
  const [hintReady, setHintReady] = useState(false) // the scroll hint waits 2 s after the ring view opens
  const [scrollReady, setScrollReady] = useState(false) // see the scroll guard below

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

  // in the ring view: the scroll hint shows up after 2 s, and scrolling is switched on after 0.9 s.
  // the scroll guard: the wheel flick that leaves the intro could otherwise keep going straight into the chapters
  useEffect(() => {
    if (view !== 'ring') return
    const hintTimer = setTimeout(() => setHintReady(true), 2000)
    const scrollTimer = setTimeout(() => setScrollReady(true), 900)
    return () => {
      clearTimeout(hintTimer)
      clearTimeout(scrollTimer)
      setHintReady(false)
      setScrollReady(false)
    }
  }, [view])

  // the scroll hint button: scroll to the first chapter (Experience) and put keyboard focus on its title
  function scrollToChapters() {
    const scroller = scrollerRef.current
    const firstChapter = scroller?.querySelector<HTMLElement>('.chapter')
    if (!scroller || !firstChapter) return
    // where the chapter is inside the scrolling layer, with a little room above it (10% of the screen)
    const top = firstChapter.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
    scroller.scrollTo({ top: top - scroller.clientHeight * 0.1, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    // preventScroll: the focus mustn't jump the page, the smooth scroll is already on its way
    firstChapter.querySelector<HTMLElement>('.chapter-title')?.focus({ preventScroll: true })
  }

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
    sceneState.orbitPitch = clamp(tilted, orbit.minPitch, orbit.maxPitch)
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
      if (event.key === 'Enter' && event.target === document.body) {
        // preventDefault: the ring view puts focus on its Back to intro button right away.
        // without this, the rest of this same key press would "click" that button and come straight back
        event.preventDefault()
        setView('ring')
      }
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
      {/* fallback null: the page background is already dark while the 3D file downloads */}
      <Suspense fallback={null}>
        <Scene
          view={view}
          openIndex={openIndex}
          onOpen={openProject}
          eventSource={appRef as React.RefObject<HTMLElement>}
        />
      </Suspense>

      {/* the scrolling layer: in the ring view, scrolling it spins the ring and dragging it orbits the camera.
          it's see-through, and mouse events still reach the 3D through eventSource */}
      <div
        ref={scrollerRef}
        // scrolls only in the ring view, and is locked while a project card is open (the card scrolls instead)
        // (and not in the first moment after entering, see the scroll guard above)
        className={`scroller ${view === 'ring' && openIndex < 0 && scrollReady ? 'can-scroll' : ''}`}
        onScroll={(event) => {
          const element = event.currentTarget
          const screen = element.clientHeight
          sceneState.scrollScreens = element.scrollTop / screen
          // the chapters start coming up from the bottom once the ring zone is scrolled past
          const chaptersStart = (ring.scrollScreens - 1) * screen
          const scrollable = element.scrollHeight - screen - chaptersStart
          const progress = (element.scrollTop - chaptersStart) / Math.max(scrollable, 1)
          sceneState.chapterProgress = clamp(progress, 0, 1)
          // has the first chapter's top come up into the screen? (hides the scroll hint, shows it again further up)
          const firstChapter = element.querySelector('.chapter')
          setChaptersInView(firstChapter ? firstChapter.getBoundingClientRect().top < element.getBoundingClientRect().bottom : false)
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
        {/* frames per second, only during `npm run dev` (import.meta.env.DEV is false on the real site) */}
        {import.meta.env.DEV && <FpsCounter />}
        <Intro shown={view === 'intro'} onEnter={() => setView('ring')} />
        <RingHud
          shown={view === 'ring'}
          onBack={backToIntro}
          onOpen={openProject}
          // the hint: 2 s after the ring opens, never with a card open, gone once the chapters come up
          hintShown={hintReady && openIndex < 0 && !chaptersInView}
          onHint={scrollToChapters}
        />
        <Footer />
        <ProjectDetail project={openIndex >= 0 ? projects[openIndex] : null} onClose={closeProject} />
      </div>
    </div>
  )
}
