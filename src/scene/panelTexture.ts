import * as THREE from 'three'
import type { Project } from '../data/projects'
import { colors, fonts } from '../theme'

// Placeholder card size. 768 / 480 = 1.6, the same shape as a panel.
const WIDTH = 768
const HEIGHT = 480

// A canvas can only draw a web font after it has downloaded. Wait for both fonts.
export async function loadPanelFonts() {
  await Promise.all([
    document.fonts.load(`120px "${fonts.calligraphy}"`),
    document.fonts.load(`400 30px "${fonts.sans}"`),
  ])
}

// Paints a placeholder card (calligraphy name + panel line) onto a hidden 2D canvas
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

  // project name: calligraphy, start big and shrink until it fits
  const nameY = HEIGHT * 0.4
  let nameSize = 130
  ctx.font = `${nameSize}px "${fonts.calligraphy}"`
  while (ctx.measureText(project.name).width > WIDTH - 120 && nameSize > 40) {
    nameSize -= 4
    ctx.font = `${nameSize}px "${fonts.calligraphy}"`
  }
  // gold gradient: gold, a soft white shine in the middle, gold again
  const gold = ctx.createLinearGradient(0, nameY - nameSize / 2, 0, nameY + nameSize / 2)
  gold.addColorStop(0, colors.gold)
  gold.addColorStop(0.5, colors.softWhite)
  gold.addColorStop(1, colors.gold)
  ctx.fillStyle = gold
  ctx.fillText(project.name, WIDTH / 2, nameY)

  // panel line: clean sans, rose grey, wrapped onto several lines if needed
  ctx.font = `400 30px "${fonts.sans}"`
  ctx.fillStyle = colors.roseGrey
  const lines = wrapText(ctx, project.panelLine, WIDTH - 160)
  lines.forEach((line, i) => {
    ctx.fillText(line, WIDTH / 2, HEIGHT * 0.7 + i * 42)
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
