import { useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { effects } from '../theme'
import { sceneState } from '../sceneState'
import { loadingState } from '../loadingState'

export type Quality = 'high' | 'low'

// Watches the frame rate and picks a quality level by itself:
// high = full pixel ratio, mirror floor and bloom. low = fewer pixels, a plain glossy floor, no bloom.
// It goes back to high when the frame rate recovers (after 2 round trips high-low-high it stays low for good).
// PerformanceMonitor measures the fps, AdaptiveDpr turns "performance" (1 or 0.8) into the pixel ratio.
export default function AutoQuality({ onChange }: { onChange: (quality: Quality) => void }) {
  const set = useThree((state) => state.set)
  const switchesRef = useRef(0) // real switches so far (PerformanceMonitor counts every reading, so it can't do this)

  function apply(quality: Quality) {
    if (sceneState.quality === quality) return
    // while she loads the page is busy for reasons that aren't the graphics chip: wait until she's been up 2 s
    const shownAt = performance.getEntriesByName('character-visible')[0]?.startTime
    if (!loadingState.get().shown || shownAt === undefined || performance.now() - shownAt < 2000) return
    // too many switches back and forth: stay low for good
    if (switchesRef.current >= 4 && quality === 'high') return
    // while the 3D is drawn at 30 fps on purpose (card open, chapters), and for 3 s after,
    // a low reading means nothing: ignore it
    if (sceneState.renderReduced || performance.now() - sceneState.lastReducedAt < 3000) return
    sceneState.quality = quality
    switchesRef.current++
    const level = quality === 'high' ? 1 : effects.lowQualityPixelRatio
    set((state) => ({ performance: { ...state.performance, current: level, max: level } }))
    onChange(quality)
  }

  return (
    <>
      <PerformanceMonitor
        bounds={() => [effects.lowQualityBelowFps, effects.highQualityAboveFps]}
        onDecline={() => apply('low')}
        onIncline={() => apply('high')}
      />
      <AdaptiveDpr />
    </>
  )
}
