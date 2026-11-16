import { useEffect, useRef, useState } from 'react'
import { sceneState } from '../sceneState'
import { everyFrame } from '../everyFrame'

// DEV ONLY (App shows it only during `npm run dev`, it is left out of the real site):
// frames per second in the top right corner, plus the quality level the scene picked for itself.
export default function FpsCounter() {
  const [text, setText] = useState('')
  const countRef = useRef({ frames: 0, start: 0 })

  useEffect(
    () =>
      everyFrame((now) => {
        const count = countRef.current
        count.frames++
        // update the number twice a second (every frame would be unreadable)
        if (now - count.start >= 500) {
          const fps = Math.round((count.frames * 1000) / (now - count.start))
          setText(`${fps} fps · ${sceneState.quality} · 3D ${sceneState.renderReduced ? '30 fps cap' : 'full'}`)
          count.frames = 0
          count.start = now
        }
      }),
    [],
  )

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
      {text}
    </div>
  )
}
