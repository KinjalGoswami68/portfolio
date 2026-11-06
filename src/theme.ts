// Every color, font and size for the site lives here.
// Change something in this one file and the whole site follows.

export const colors = {
  background: '#0A0506', // near-black (background, fog)
  maroon: '#3B0A12', // deep maroon (floor, panel backgrounds)
  cherry: '#9E1B32', // cherry red
  cherryGlow: '#D2042D', // glowing cherry (floor glow, highlights)
  gold: '#E8C27A', // champagne gold (calligraphy, sparkle, thin frames)
  softWhite: '#F4EDEE', // body text
  roseGrey: '#B9A7AB', // secondary text
}

// The three calligraphy fonts you can choose between.
export const calligraphyFonts = ['Imperial Script', 'MonteCarlo', 'Hurricane'] as const

export const fonts = {
  // change this to 'MonteCarlo' or 'Hurricane' to compare. big titles and project names only
  calligraphy: 'Imperial Script' as (typeof calligraphyFonts)[number],
  sans: 'Inter', // everything else
}

export const world = {
  floorRadius: 16, // big, so its edges disappear into the fog
  glowRadius: 3.5, // size of the cherry glow under the character
  reflectionResolution: 512, // lower (256) = faster, blurrier reflections
  reflectionStrength: 15, // how strongly the floor mirrors things. 0 = no reflection
  fogNear: 10, // fog starts this far from the camera
  fogFar: 28, // and is fully black this far away
  starCount: 1500, // fewer stars = lighter on integrated graphics
  dustCount: 60, // floating dust particles
}

export const character = {
  scale: 1.2, // she's about 1.6 units tall in the file, 1.2x makes her about 2
  idleAnimation: 'idle.fbx', // Mixamo file in public/animations/
}

export const ring = {
  radius: 6.5, // distance from the character to the panels
  panelWidth: 3, // width of one panel (measured along its curve)
  panelHeight: 1.875, // 3 / 1.875 = 1.6, roughly a 16:10 screenshot
  panelY: 1.4, // height of the panel's center above the floor
  frameThickness: 0.04, // how much gold frame shows around each picture
  panelEmission: 0.6, // how much the picture glows by itself (0 = only lit by lights)
  spinSpeed: 0.05, // radians per second (a full turn takes about 2 minutes)
}
