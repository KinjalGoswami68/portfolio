// The character's loading progress, shared by the 3D side (which loads her)
// and the HTML loader at her spot (which shows it). A tiny store React can subscribe to.

type LoadingState = {
  percent: number // 0 to 100, real bytes downloaded of the model + the 3 animations
  shown: boolean // true once she is on screen (the loader goes away)
  failed: boolean // true if the model couldn't load (the loader goes away, a stand-in shows)
}

// file sizes, measured at build time (vite.config.ts). used as the "total" for the percentage,
// because GitHub Pages gzips the .vrm and the browser reports unzipped bytes as they arrive
const expectedBytes: Record<string, number> = __ASSET_BYTES__
const loadedBytes: Record<string, number> = {}

let state: LoadingState = { percent: 0, shown: false, failed: false }
const listeners = new Set<() => void>()

function set(change: Partial<LoadingState>) {
  state = { ...state, ...change }
  listeners.forEach((listener) => listener())
}

export const loadingState = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  // called by the loaders as bytes arrive. file = 'kinjal.vrm', 'walk.fbx', ...
  reportBytes(file: string, loaded: number) {
    loadedBytes[file] = loaded
    let done = 0
    let total = 0
    for (const [name, size] of Object.entries(expectedBytes)) {
      done += Math.min(loadedBytes[name] ?? 0, size)
      total += size
    }
    // 99 at most: 100 means "she's here", and parsing still takes a moment after the last byte
    const percent = total > 0 ? Math.min(99, Math.floor((done / total) * 100)) : 0
    if (percent !== state.percent) set({ percent })
  },
  markShown: () => set({ shown: true, percent: 100 }),
  markFailed: () => set({ failed: true }),
}
