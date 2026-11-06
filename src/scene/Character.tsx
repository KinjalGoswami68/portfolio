import { Suspense } from 'react'
import PlaceholderGirl from './PlaceholderGirl'
import VrmCharacter from './VrmCharacter'

// THE ONE-LINE SWAP: the VRM file in public/models/, or null to show only the placeholder.
const MODEL_FILE: string | null = 'kinjal.vrm'

// The girl at the center of the floor.
export default function Character() {
  if (!MODEL_FILE) return <PlaceholderGirl />

  return (
    // fallback={null}: nothing while the model downloads, so the mannequin
    // doesn't stand at her spot and vanish right before she walks in
    <Suspense fallback={null}>
      <VrmCharacter file={MODEL_FILE} />
    </Suspense>
  )
}
