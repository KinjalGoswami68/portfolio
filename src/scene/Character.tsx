import { Component, Suspense, type ReactNode } from 'react'
import PlaceholderGirl from './PlaceholderGirl'
import VrmCharacter from './VrmCharacter'
import { loadingState } from '../loadingState'

// THE ONE-LINE SWAP: the VRM file in public/models/, or null to show only the placeholder.
const MODEL_FILE: string | null = 'kinjal.vrm'

// The girl at the center of the floor.
export default function Character() {
  if (!MODEL_FILE) return <PlaceholderGirl />

  return (
    // if the model can't load (bad connection, missing file), show the simple stand-in
    // instead of letting the error take the whole page down
    <ModelErrorBoundary fallback={<PlaceholderGirl />}>
      {/* fallback={null}: nothing in 3D while she downloads. the HTML loader shows at her spot */}
      <Suspense fallback={null}>
        <VrmCharacter file={MODEL_FILE} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

// React only catches loading errors with a class component like this one (an "error boundary")
class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn(`${MODEL_FILE} failed to load, showing the placeholder instead:`, error)
    loadingState.markFailed()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
