// Every color and size for the site lives here.
// Change the palette in this one file and the whole scene follows.

export const colors = {
  background: '#050505', // near-black space
  floor: '#ff5a4e', // coral-red glowing floor
  accent: '#2ec4b6', // cool teal accent (used more in later parts)
  character: '#8a8a8a', // gray placeholder capsule
  panelBack: '#111111', // the outside (back) of each project panel
  placeholderText: '#f5f5f5', // title text on placeholder panels
  // background colors for placeholder panels, used in turn
  placeholders: ['#1f7a72', '#a33a32', '#2b3a55'],
}

export const sizes = {
  floorRadius: 6, // how wide the glowing circle is
  starCount: 3000, // fewer stars = lighter on integrated graphics
}

export const ring = {
  radius: 6.5, // distance from the character to the panels
  panelWidth: 3, // width of one panel (measured along its curve)
  panelHeight: 1.875, // 3 / 1.875 = 1.6, roughly a 16:10 screenshot
  panelY: 1.4, // height of the panel's center above the floor
  spinSpeed: 0.05, // radians per second (a full turn takes about 2 minutes)
}
