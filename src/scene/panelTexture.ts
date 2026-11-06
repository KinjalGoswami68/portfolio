import * as THREE from 'three'
import type { Project } from '../data/projects'
import { colors, fonts } from '../theme'

// Placeholder card size. 1024 / 640 = 1.6, the same shape as a panel.
// bigger canvas = sharper text in 3D (but more memory, so not bigger than this)
const WIDTH = 1024
const HEIGHT = 640

// A canvas can only draw a web font after it has downloaded. Wait for both fonts.
export async function loadPanelFonts() {
  await Promise.all([
    document.fonts.load(`200px "${fonts.title}"`),
    document.fonts.load(`400 40px "${fonts.body}"`),
  ])
}

// Paints a placeholder card (project name + panel line) onto a hidden 2D canvas
// and turns it into a texture. Used until a screenshot exists in public/projects/.
export function makePlaceholderTexture(project: Project) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!

  // background: deep maroon at the top fading to near-black at the bottom
  const background = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  background.addColorStop(0, colors.maroon)
  background.addColorStop(1, colors.background)
  ctx.fillStyle = background
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // project name: Anton, as big as fits (big = readable from the ring camera)
  const nameY = HEIGHT * 0.4
  let nameSize = 200
  ctx.font = `${nameSize}px "${fonts.title}"`
  while (ctx.measureText(project.name).width > WIDTH - 120 && nameSize > 60) {
    nameSize -= 4
    ctx.font = `${nameSize}px "${fonts.title}"`
  }
  // champagne gold, with a soft lighter band through the middle
  const gold = ctx.createLinearGradient(0, nameY - nameSize / 2, 0, nameY + nameSize / 2)
  gold.addColorStop(0, colors.gold)
  gold.addColorStop(0.5, colors.softWhite)
  gold.addColorStop(1, colors.gold)
  ctx.fillStyle = gold
  ctx.fillText(project.name, WIDTH / 2, nameY)

  // panel line: Inter, rose grey, wrapped onto several lines if needed
  ctx.font = `400 40px "${fonts.body}"`
  ctx.fillStyle = colors.roseGrey
  const lines = wrapText(ctx, project.panelLine, WIDTH - 160)
  lines.forEach((line, i) => {
    ctx.fillText(line, WIDTH / 2, HEIGHT * 0.72 + i * 54)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace // tells three.js these are normal screen colors
  return texture
}

// Splits text into lines that each fit inside maxWidth.
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const attempt = line ? `${line} ${word}` : word
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = attempt
    }
  }
  lines.push(line)
  return lines
}

// Like CSS object-fit: cover. Uses only the middle part of the image that
// matches the panel's shape, so the screenshot is cropped, never stretched.
export function coverCrop(texture: THREE.Texture, panelAspect: number) {
  const image = texture.image as HTMLImageElement
  const imageAspect = image.width / image.height
  if (imageAspect > panelAspect) {
    // image is wider than the panel: use less of its width
    texture.repeat.set(panelAspect / imageAspect, 1)
  } else {
    // image is taller than the panel: use less of its height
    texture.repeat.set(1, imageAspect / panelAspect)
  }
  // center the used part
  texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2)
}

// The frame shimmer: a dim strip with one bright stripe in the middle.
// Used as the gold frame's glow map and slid sideways every frame, so the stripe sweeps across.
export function makeShimmerTexture() {
  const width = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = 4
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, 'rgb(100, 100, 100)') // dim: the frame's normal glow
  gradient.addColorStop(0.42, 'rgb(100, 100, 100)')
  gradient.addColorStop(0.5, 'rgb(255, 255, 255)') // the bright stripe
  gradient.addColorStop(0.58, 'rgb(100, 100, 100)')
  gradient.addColorStop(1, 'rgb(100, 100, 100)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, 4)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping // sliding past the edge wraps around, so the sweep loops
  return texture
}

// Moves the shimmer stripe. loops = how many sweeps have happened so far (only the part after the dot matters)
export function slideShimmer(texture: THREE.Texture, loops: number) {
  texture.offset.x = -(loops % 1)
}
