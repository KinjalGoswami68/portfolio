import { useEffect, useState } from 'react'

// DEV ONLY (App shows it only during `npm run dev`, it is left out of the real site):
// frames per second in the top right corner. It only reads the time, it changes nothing in the scene.
export default function FpsCounter() {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    const count = { frames: 0, start: performance.now(), id: 0 }
    const tick = (now: number) => {
      count.frames++
      // update the number twice a second (every frame would be unreadable)
      if (now - count.start >= 500) {
        setFps(Math.round((count.frames * 1000) / (now - count.start)))
        count.frames = 0
        count.start = now
      }
      count.id = requestAnimationFrame(tick)
    }
    count.id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(count.id)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 100,
        padding: '3px 8px',
        font: '12px/1.4 monospace',
        color: '#7CFC9A',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    >
      {fps} fps
    </div>
  )
}
