// Calls `callback` once per screen refresh (requestAnimationFrame) until the returned stop function is called.
export function everyFrame(callback: (now: number) => void) {
  let id = requestAnimationFrame(function tick(now) {
    id = requestAnimationFrame(tick)
    callback(now)
  })
  return () => cancelAnimationFrame(id)
}
