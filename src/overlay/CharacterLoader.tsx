import { useSyncExternalStore } from 'react'
import { loadingState } from '../loadingState'
import type { View } from '../App'

// While she downloads: a soft glowing gold ring with the real download percentage, at her spot.
// It fades out the moment she appears (or if her model can't load and the stand-in shows instead).
export default function CharacterLoader({ view }: { view: View }) {
  const { percent, shown, failed } = useSyncExternalStore(loadingState.subscribe, loadingState.get)
  const done = shown || failed

  return (
    <div
      className={`character-loader at-${view} ${done ? 'is-done' : ''}`}
      role="progressbar"
      aria-label="Loading the 3D character"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-hidden={done}
    >
      <div className="loader-ring" />
      <span className="loader-percent">{percent}%</span>
    </div>
  )
}
