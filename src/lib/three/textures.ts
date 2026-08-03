import * as THREE from 'three'

function createCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

function finish(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/**
 * Crema surface with a poured rosetta. Drawn rather than loaded so the foam
 * stays crisp at any resolution and needs no asset round-trip.
 */
export function createLatteArtTexture(size = 768) {
  const canvas = createCanvas(size)
  const ctx = canvas.getContext('2d')!
  const c = size / 2

  const crema = ctx.createRadialGradient(c, c * 0.86, size * 0.05, c, c, c)
  crema.addColorStop(0, '#d6a165')
  crema.addColorStop(0.55, '#bd8146')
  crema.addColorStop(0.86, '#9d6533')
  crema.addColorStop(1, '#7d4b24')
  ctx.fillStyle = crema
  ctx.beginPath()
  ctx.arc(c, c, c, 0, Math.PI * 2)
  ctx.fill()

  // Micro-foam speckle.
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 900; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random()) * c * 0.98
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#3a1d0c'
    ctx.beginPath()
    ctx.arc(c + Math.cos(angle) * radius, c + Math.sin(angle) * radius, Math.random() * 2.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Rosetta: stacked crescents narrowing toward the stem.
  ctx.fillStyle = '#f4e6d2'
  ctx.shadowColor = 'rgba(60, 30, 10, 0.35)'
  ctx.shadowBlur = size * 0.012
  const leaves = 8
  for (let i = 0; i < leaves; i++) {
    const t = i / (leaves - 1)
    const y = c - size * 0.26 + t * size * 0.5
    const halfWidth = size * (0.215 - t * 0.17)
    const lift = size * (0.085 - t * 0.055)

    ctx.beginPath()
    ctx.moveTo(c - halfWidth, y)
    ctx.quadraticCurveTo(c, y - lift, c + halfWidth, y)
    ctx.quadraticCurveTo(c, y + lift * 0.42, c - halfWidth, y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.shadowBlur = 0

  // Stem drawn back through the leaves.
  ctx.strokeStyle = '#f6ead9'
  ctx.lineWidth = size * 0.018
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(c, c - size * 0.3)
  ctx.lineTo(c, c + size * 0.3)
  ctx.stroke()

  // Rim darkening where the foam meets the glass.
  const rim = ctx.createRadialGradient(c, c, c * 0.8, c, c, c)
  rim.addColorStop(0, 'rgba(0,0,0,0)')
  rim.addColorStop(1, 'rgba(46, 22, 8, 0.55)')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(c, c, c, 0, Math.PI * 2)
  ctx.fill()

  return finish(canvas)
}

/**
 * Warm studio backdrop. Doubles as the plate the glass refracts, so the
 * transmission pass has something to bend instead of empty alpha.
 */
export function createBackdropTexture(size = 1024) {
  const canvas = createCanvas(size)
  const ctx = canvas.getContext('2d')!

  const base = ctx.createLinearGradient(0, 0, size * 0.35, size)
  base.addColorStop(0, '#f7ecdb')
  base.addColorStop(0.42, '#e6cca8')
  base.addColorStop(0.74, '#c1996d')
  base.addColorStop(1, '#9b7148')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Soft key bloom behind the product — kept well under blowout so the
  // Bloom pass has headroom instead of clipping to white.
  const bloom = ctx.createRadialGradient(
    size * 0.5,
    size * 0.36,
    size * 0.04,
    size * 0.5,
    size * 0.36,
    size * 0.6,
  )
  bloom.addColorStop(0, 'rgba(255, 246, 230, 0.62)')
  bloom.addColorStop(0.4, 'rgba(249, 228, 199, 0.28)')
  bloom.addColorStop(1, 'rgba(150, 105, 62, 0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, size, size)

  const corner = ctx.createRadialGradient(
    size * 0.5,
    size * 0.46,
    size * 0.22,
    size * 0.5,
    size * 0.46,
    size * 0.8,
  )
  corner.addColorStop(0, 'rgba(0,0,0,0)')
  corner.addColorStop(0.62, 'rgba(96, 61, 30, 0.2)')
  corner.addColorStop(1, 'rgba(74, 44, 20, 0.62)')
  ctx.fillStyle = corner
  ctx.fillRect(0, 0, size, size)

  return finish(canvas)
}

/** Soft round sprite used by the steam and gold-dust point clouds. */
export function createSoftSpriteTexture(size = 128) {
  const canvas = createCanvas(size)
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return finish(canvas)
}
