import * as THREE from 'three'

// Paints a colored card with a title onto a hidden 2D canvas,
// then turns that canvas into a texture the 3D panel can wear.
// Used until a real screenshot exists in public/projects/.
export function makePlaceholderTexture(title: string, background: string, textColor: string) {
  const width = 512
  const height = 320 // 512 / 320 = 1.6, same shape as the panel
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // background
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  // thin see-through border
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = textColor
  ctx.lineWidth = 4
  ctx.strokeRect(16, 16, width - 32, height - 32)
  ctx.globalAlpha = 1

  // title: start big, shrink until it fits inside the border
  let fontSize = 64
  ctx.font = `bold ${fontSize}px sans-serif`
  while (ctx.measureText(title).width > width - 80 && fontSize > 16) {
    fontSize -= 2
    ctx.font = `bold ${fontSize}px sans-serif`
  }
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, width / 2, height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace // tells three.js these are normal screen colors
  return texture
}
