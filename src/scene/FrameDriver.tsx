import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { effects } from '../theme'
import { sceneState } from '../sceneState'
import { everyFrame } from '../everyFrame'

// Decides when the 3D gets drawn. The Canvas never draws by itself (frameloop="never"): this draws each frame
// with advance(), right inside the screen refresh it decides on:
// - every frame, normally
// - every other frame (30 fps) while the 3D is mostly covered: a project card is open, or the chapters are on screen
// - never while the browser tab is hidden
export default function FrameDriver({ openIndex }: { openIndex: number }) {
  const advance = useThree((state) => state.advance)
  const openedAtRef = useRef(-1) // performance.now() when the current card opened (-1 = no card)
  const frameRef = useRef(0) // counts screen refreshes (to draw every other one)

  useEffect(() => {
    openedAtRef.current = openIndex >= 0 ? performance.now() : -1
  }, [openIndex])

  useEffect(
    () =>
      everyFrame((now) => {
        if (document.hidden) return // tab in the background: draw nothing
        const cardSettled = openedAtRef.current >= 0 && now - openedAtRef.current > effects.cardSettleSeconds * 1000
        const covered = cardSettled || sceneState.chapterProgress > effects.chaptersCoverAt
        sceneState.renderReduced = covered
        if (covered) sceneState.lastReducedAt = now
        frameRef.current++
        if (!covered || frameRef.current % 2 === 0) advance(now)
      }),
    [advance],
  )

  return null
}
