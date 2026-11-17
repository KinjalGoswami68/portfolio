// A shared notebook: the HTML side and the 3D side both read and write here.
// Plain variables, not React state, because they change on every scroll tick or frame
// and nothing needs React to redraw when they do.
export const sceneState = {
  ringActive: false, // true in the ring view (panels can be hovered)
  scrollScreens: 0, // how far the page has scrolled, in screen heights
  chapterProgress: 0, // 0 = chapters not reached yet, 1 = scrolled to the very bottom
  orbitYaw: 0, // where the visitor has dragged the camera around her (radians, the goal)
  orbitPitch: 0, // and how far up or down they've tilted it (the goal)
  lastOrbitDragAt: -Infinity, // performance.now() of the last drag, for the glide back
  orbitSnap: false, // true = jump straight to the goal next frame (double-click reset)
  hoveredIndex: -1, // which panel the mouse is on (-1 = none)
  hoveredPosition: { x: 0, y: 0, z: 0 }, // where that panel's center is in the world
  // (a plain object, not a THREE.Vector3, so this file doesn't pull three.js into the first download)
}
