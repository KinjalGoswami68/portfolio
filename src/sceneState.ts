import * as THREE from 'three'

// A shared notebook: the HTML side and the 3D side both read and write here.
// Plain variables, not React state, because they change on every scroll tick or frame
// and nothing needs React to redraw when they do.
export const sceneState = {
  ringActive: false, // true in the ring view (panels can be hovered)
  scrollScreens: 0, // how far the page has scrolled, in screen heights
  dragAngle: 0, // radians the visitor has dragged the ring by
  hoveredIndex: -1, // which panel the mouse is on (-1 = none)
  hoveredPosition: new THREE.Vector3(), // where that panel's center is in the world
}
