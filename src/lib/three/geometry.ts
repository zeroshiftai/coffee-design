import * as THREE from 'three'

/**
 * Roasted coffee bean: an ellipsoid pressed with a crease down both faces.
 * Vertex colours darken inside the crease so the groove reads without a texture.
 */
export function createBeanGeometry() {
  const geometry = new THREE.SphereGeometry(1, 44, 30)
  geometry.scale(0.62, 0.9, 0.46)

  const position = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(position.count * 3)

  const shell = new THREE.Color('#54301b')
  const groove = new THREE.Color('#1d0d05')
  const mix = new THREE.Color()

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)

    // Gaussian valley centred on the x=0 meridian, fading out near the tips.
    const tipFade = 1 - Math.min(1, (Math.abs(y) / 0.9) ** 4)
    const crease = Math.exp(-((x / 0.15) ** 2)) * tipFade

    position.setZ(i, z - Math.sign(z) * crease * Math.abs(z) * 0.92)
    // Nudge the shoulders outward so the bean stays plump beside the groove.
    position.setX(i, x * (1 + crease * 0.05))

    const shade = 0.82 + Math.sin(y * 9 + x * 5) * 0.06 + Math.random() * 0.08
    mix.copy(shell).multiplyScalar(shade).lerp(groove, Math.min(1, crease * 1.25))
    colors[i * 3] = mix.r
    colors[i * 3 + 1] = mix.g
    colors[i * 3 + 2] = mix.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Silhouette of a double-wall latte glass, revolved into a solid.
 * Runs up the outer wall, over the rim, then back down the tapered inner cone —
 * so a single lathe produces a watertight shell that transmission can refract.
 */
const GLASS_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.22, 0.006],
  [0.35, 0.03],
  [0.432, 0.1],
  [0.464, 0.24],
  [0.478, 0.7],
  [0.483, 1.3],
  [0.485, 1.78],
  [0.472, 1.845],
  [0.447, 1.835],
  [0.427, 1.75],
  [0.396, 1.32],
  [0.34, 0.86],
  [0.271, 0.5],
  [0.222, 0.31],
  [0.207, 0.268],
  [0.0, 0.252],
]

export const GLASS_HEIGHT = 1.845
export const GLASS_RADIUS = 0.485
export const LIQUID_SURFACE = 1.55

export function createGlassGeometry(segments = 96) {
  const points = GLASS_PROFILE.map(([x, y]) => new THREE.Vector2(x, y))
  const geometry = new THREE.LatheGeometry(points, segments)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * The latte itself: the inner cavity filled to `surface`, vertex-coloured from
 * espresso at the base through caramel to milk at the top.
 */
export function createLiquidGeometry(surface = LIQUID_SURFACE, segments = 80) {
  const wall: [number, number][] = [
    [0.0, 0.258],
    [0.2, 0.272],
    [0.236, 0.34],
    [0.283, 0.52],
    [0.346, 0.9],
    [0.386, 1.25],
    [0.402, surface],
  ]

  const geometry = new THREE.LatheGeometry(
    wall.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )

  const position = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(position.count * 3)

  // Layered like a latte macchiato — steamed milk settles at the base, the
  // espresso floats above it, exactly the banding in the reference.
  const milk = new THREE.Color('#f2e0c6')
  const caramel = new THREE.Color('#b06f2b')
  const espresso = new THREE.Color('#3f1d0b')
  const mix = new THREE.Color()

  for (let i = 0; i < position.count; i++) {
    const t = THREE.MathUtils.clamp((position.getY(i) - 0.26) / (surface - 0.26), 0, 1)
    if (t < 0.5) {
      mix.copy(milk).lerp(caramel, THREE.MathUtils.smoothstep(t, 0.12, 0.5))
    } else {
      mix.copy(caramel).lerp(espresso, THREE.MathUtils.smoothstep(t, 0.5, 0.92))
    }
    colors[i * 3] = mix.r
    colors[i * 3 + 1] = mix.g
    colors[i * 3 + 2] = mix.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Flat ribbon swept along a curve using Frenet frames — used for the gold
 * swooshes and the milk swirl. `widthFn` tapers the ends; `twistFn` rolls the
 * cross-section around the tangent so the ribbon catches light as it folds
 * instead of reading as a flat cutout.
 */
export function createRibbonGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 200,
  widthFn: (t: number) => number = () => 0.2,
  twistFn: (t: number) => number = () => 0,
) {
  const frames = curve.computeFrenetFrames(segments, false)
  const positions = new Float32Array((segments + 1) * 6)
  const normals = new Float32Array((segments + 1) * 6)
  const uvs = new Float32Array((segments + 1) * 4)
  const indices: number[] = []

  const point = new THREE.Vector3()
  const across = new THREE.Vector3()
  const facing = new THREE.Vector3()
  const left = new THREE.Vector3()
  const right = new THREE.Vector3()

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    curve.getPointAt(t, point)

    const half = widthFn(t) * 0.5
    const twist = twistFn(t)
    const binormal = frames.binormals[i]
    const normal = frames.normals[i]

    // Roll the width axis (and its normal) around the tangent by `twist`.
    across.copy(binormal).multiplyScalar(Math.cos(twist)).addScaledVector(normal, Math.sin(twist))
    facing.copy(normal).multiplyScalar(Math.cos(twist)).addScaledVector(binormal, -Math.sin(twist))

    left.copy(point).addScaledVector(across, -half)
    right.copy(point).addScaledVector(across, half)

    positions.set([left.x, left.y, left.z, right.x, right.y, right.z], i * 6)
    normals.set([facing.x, facing.y, facing.z, facing.x, facing.y, facing.z], i * 6)
    uvs.set([t, 0, t, 1], i * 4)

    if (i < segments) {
      const o = i * 2
      indices.push(o, o + 1, o + 2, o + 1, o + 3, o + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

/** Gold swooshes that arc behind and around the cup. */
export function createGoldRibbonCurves() {
  return [
    {
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.9, -1.5, -2.4),
        new THREE.Vector3(-1.9, 0.45, -1.5),
        new THREE.Vector3(-0.3, 1.6, -2.5),
        new THREE.Vector3(1.75, 0.7, -1.6),
        new THREE.Vector3(3.05, -1.0, -2.5),
      ]),
      width: (t: number) => 0.05 + Math.sin(t * Math.PI) ** 0.6 * 0.26,
      twist: (t: number) => t * Math.PI * 1.15,
    },
    {
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.85, -2.15, -0.6),
        new THREE.Vector3(-1.4, -1.55, 0.2),
        new THREE.Vector3(0.5, -1.95, -0.1),
        new THREE.Vector3(2.4, -1.25, -0.7),
        new THREE.Vector3(3.3, -0.35, -1.6),
      ]),
      width: (t: number) => 0.04 + Math.sin(t * Math.PI) ** 0.8 * 0.19,
      twist: (t: number) => -0.4 + t * Math.PI * 0.85,
    },
    {
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.4, 1.9, -2.8),
        new THREE.Vector3(-1.0, 0.55, -2.5),
        new THREE.Vector3(1.2, 1.15, -3.0),
        new THREE.Vector3(3.5, 2.2, -2.6),
      ]),
      width: (t: number) => 0.025 + Math.sin(t * Math.PI) ** 0.9 * 0.085,
      twist: (t: number) => t * Math.PI * 0.6,
    },
  ]
}

/** Glass handle: a tube looping out from the cup wall and back. */
export function createHandleGeometry(lowPower = false) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(GLASS_RADIUS - 0.03, 1.44, 0),
    new THREE.Vector3(0.79, 1.35, 0),
    new THREE.Vector3(0.87, 1.04, 0),
    new THREE.Vector3(0.79, 0.73, 0),
    new THREE.Vector3(GLASS_RADIUS - 0.04, 0.63, 0),
  ])
  return new THREE.TubeGeometry(curve, lowPower ? 32 : 72, 0.052, lowPower ? 8 : 16, false)
}

/** Milk pour that wraps the glass and flares out behind it. */
export function createMilkSwirlCurve() {
  const points: THREE.Vector3[] = []
  const steps = 10
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = -2.5 + t * 4.9
    const radius = 1.25 + Math.sin(t * Math.PI) * 0.62
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        -0.4 + t * 2.35,
        Math.sin(angle) * radius * 0.8,
      ),
    )
  }
  return new THREE.CatmullRomCurve3(points)
}
