// Downloads a file as raw bytes, and doesn't give up on the first hiccup:
// - a failed download (connection dropped, server error) is tried again
// - a stalled download (no new bytes for STALL_SECONDS) is cancelled and tried again
// - a missing file (404 and the like) fails straight away, retrying won't help
// Waits 1 s, 2 s, 4 s between tries. After the last try it gives up with the error.

const ATTEMPTS = 4
const STALL_SECONDS = 15

export async function fetchWithRetry(url: string): Promise<ArrayBuffer> {
  const name = url.split('/').pop()
  for (let attempt = 1; ; attempt++) {
    try {
      // first try: may reuse the early download from the <link rel="preload"> in index.html.
      // later tries: a brand new request ('reload'), never a stuck or broken one from before
      return await fetchOnce(url, attempt === 1 ? 'default' : 'reload')
    } catch (error) {
      if (error instanceof MissingFileError || attempt === ATTEMPTS) throw error
      const wait = 1000 * 2 ** (attempt - 1)
      console.warn(`${name}: download failed (try ${attempt} of ${ATTEMPTS}), trying again in ${wait / 1000} s:`, String(error))
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
  }
}

class MissingFileError extends Error {}

async function fetchOnce(url: string, cache: RequestCache): Promise<ArrayBuffer> {
  const controller = new AbortController()
  // the stall timer: restarted every time bytes arrive. if it runs out, the download is cancelled
  let timer: ReturnType<typeof setTimeout> | undefined
  const restartTimer = () => {
    clearTimeout(timer)
    timer = setTimeout(() => controller.abort(new Error(`no data for ${STALL_SECONDS} s`)), STALL_SECONDS * 1000)
  }
  restartTimer()
  try {
    const response = await fetch(url, { signal: controller.signal, cache })
    if (response.status >= 400 && response.status < 500) throw new MissingFileError(`${response.status} ${url}`)
    if (!response.ok || !response.body) throw new Error(`${response.status} ${url}`)
    // read it piece by piece, so a stall in the middle is noticed too
    const reader = response.body.getReader()
    const pieces: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      pieces.push(value)
      total += value.length
      restartTimer()
    }
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const piece of pieces) {
      bytes.set(piece, offset)
      offset += piece.length
    }
    return bytes.buffer
  } finally {
    clearTimeout(timer)
  }
}
