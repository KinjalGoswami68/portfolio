// Every color, font and size for the site lives here.
// Change something in this one file and the whole site follows.

export const colors = {
  background: '#0A0506', // near-black (background, fog)
  maroon: '#3B0A12', // deep maroon (floor, panel backgrounds)
  cherry: '#9E1B32', // cherry red
  cherryGlow: '#D2042D', // glowing cherry (floor glow, highlights)
  gold: '#E8C27A', // champagne gold (titles, sparkle, thin frames)
  goldBright: '#FFE6A8', // bright gold highlight (the shine on titles, so gold never looks dull brown)
  softWhite: '#F4EDEE', // body text
  roseGrey: '#B9A7AB', // secondary text
}

// free Google Fonts, loaded in index.html
export const fonts = {
  title: 'Anton', // titles and project names (bold, straight)
  body: 'Inter', // everything else
}

export const world = {
  floorRadius: 16, // big, so its edges disappear into the fog
  glowRadius: 3.5, // size of the cherry glow under the character
  reflectionResolution: 512, // lower (256) = faster, blurrier reflections
  reflectionStrength: 15, // how strongly the floor mirrors things. 0 = no reflection
  fogNear: 10, // fog starts this far from the camera
  fogFar: 28, // and is fully black this far away
  starCount: 1500, // fewer stars = lighter on integrated graphics
  // sparkles: how many, and how big each dot is (the burst when a panel opens is set in ProjectRing)
  dustCount: 30, // floating dust particles in the air
  dustSize: 1,
  ringDustCount: 35, // gold dust drifting around the ring
  ringDustSize: 1.5,
  herSparkleCount: 12, // a few sparkles around her
  herSparkleSize: 1.5,
  glowBoost: 8, // how much brighter than "normal" the floor glow is, so bloom picks it up
  sparkleBoost: 3, // same for the sparkles
}

// Post-processing: effects applied to the finished picture, like a photo filter
export const effects = {
  maxPixelRatio: 1.25, // lower than before: the effects add work for every pixel
  bloomThreshold: 0.9, // only things brighter than this glow (floor glow, sparkles, frame shimmer)
  bloomIntensity: 1.1, // how strong the glow is
  bloomRadius: 0.7, // how far the glow spreads
  grain: 0.035, // film grain strength (0 = off)
  vignetteDarkness: 0.75, // how dark the corners get
}

// The two camera spots. position = where the eye is, target = the point it looks at.
export const cameraViews = {
  // close on her upper body. looking a bit to her left puts her on the right half of the screen
  intro: { position: [-0.6, 1.5, 1.9], target: [-0.6, 1.4, 0] },
  // high and back: the whole ring
  ring: { position: [0, 6, 10], target: [0, 1, 0] },
  // while reading the chapters: pulled back further and risen, the scene stays alive behind
  chapters: { position: [0, 9, 16], target: [0, 2, 0] },
  moveSpeed: 2.2, // how quickly the camera glides between spots (higher = faster)
  // intro: gentle drift with the mouse (units the camera moves at the screen edge)
  introDrift: [0.08, 0.05],
  // ring view: drag to orbit around her (limited and cinematic)
  orbit: {
    yawPerPixel: 0.005, // horizontal turn per pixel dragged (radians). full 360 allowed
    pitchPerPixel: 0.003, // vertical tilt per pixel dragged
    minPitch: -0.25, // lowest tilt (radians, about 14 degrees down from the default)
    maxPitch: 0.45, // highest tilt (about 26 degrees up)
    minElevation: 8, // safety limits in degrees above the floor: never under it...
    maxElevation: 60, // ...never straight top-down
    ease: 4, // smoothness of the orbit (higher = snappier)
    returnDelay: 3, // seconds without dragging before gliding back to the default angle
    returnSpeed: 0.6, // how slowly it glides back (lower = slower)
    mouseDrift: [0.06, 0.03], // tiny extra turn/tilt from the mouse position (radians at the screen edge)
  },
} as const

export const character = {
  scale: 1.2, // she's about 1.6 units tall in the file, 1.2x makes her about 2
  walkStartX: -3.5, // where the walk-in starts (just past the left edge of the intro view)
  waveRepeats: 4, // wave.fbx is a 0.53s waving loop, so one wave = this many loops (about 2s)
  blendSeconds: 0.5, // how long one animation takes to blend into the next
  turnSpeed: 4, // how fast she turns from walking sideways to facing the camera
  headTurn: 0.25, // how far her head follows the mouse sideways (radians, about 14 degrees)
  headTilt: 0.1, // and up/down (about 6 degrees)
  blinkGapMin: 2, // seconds between blinks: random, between min and max
  blinkGapMax: 6,
  blinkSeconds: 0.15, // one blink, closed and open again
  gestureGapMin: 8, // seconds between small natural actions: random, between min and max
  gestureGapMax: 12,
  hoverHeadTurn: 0.8, // how far she can turn her head toward a hovered panel (radians, about 45 degrees)
}

export const ring = {
  radius: 6.5, // distance from the character to the panels
  panelWidth: 3, // width of one panel (measured along its curve)
  panelHeight: 1.875, // 3 / 1.875 = 1.6, roughly a 16:10 screenshot
  panelY: 1.4, // height of the panel's center above the floor
  frameThickness: 0.04, // how much gold frame shows around each picture
  panelEmission: 0.6, // how much the picture glows by itself (0 = only lit by lights)
  spinSpeed: 0.05, // radians per second (a full turn takes about 2 minutes)
  fadeSpeed: 3, // how quickly the ring fades in/out when you enter or go back
  scrollTurn: 1.2, // extra spin per screen-height of scrolling (radians)
  spinEase: 4, // how quickly scroll/drag spin catches up (higher = snappier)
  blockerSink: 2.4, // how far panels in front of her sink below the floor
  scrollScreens: 2.5, // how tall the ring part of the page is, in screen heights
  frameGlow: 1.6, // the gold frame's own glow, normally (the shimmer stripe is the part that blooms)
  hoverFrameGlow: 4, // ...and when hovered (the whole frame blooms)
  shimmerSpeed: 0.12, // how fast the shimmer stripe sweeps across the frames (loops per second)
  hoverLift: 0.15, // how far a hovered panel rises
  openDistance: 5, // how far in front of the camera an open panel floats
  openSpeed: 5, // how fast it flies to the front and back (higher = faster)
  dimmedOpacity: 0.2, // the other panels while one is open
  burstSeconds: 1.8, // how long the gold sparkle burst lasts
}
