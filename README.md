# Coffee Maison — WebGL Coffee Atelier

A warm, luxury coffee landing page whose hero is a real **Three.js** scene: a
double-wall glass latte mug floating over a cream podium, orbiting coffee beans,
suspended ice, a milk pour, rising steam, and brushed-gold ribbons — all reacting to
pointer and scroll.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **React Three Fiber**, **drei**,
**postprocessing**, **GSAP + ScrollTrigger**, and **Lenis**.

## The scene ships with no 3D assets

Every mesh, material, and map in the hero is generated at runtime — there is no `.glb`,
no HDRI, and no texture download. Nothing in the scene touches the network.

- **Glass mug** — a lathed double-wall profile (outer wall → rim → tapered inner cone)
  rendered as one watertight solid with real `transmission`, plus a swept-tube handle.
- **The latte** — a lathe filled to the surface line and vertex-coloured in macchiato
  order: steamed milk at the base, caramel through the middle, espresso on top.
- **Crema + rosetta** — drawn to a `<canvas>` with gradients and bezier leaves.
- **Coffee beans** — a sphere squashed into an ellipsoid, then creased along the x=0
  meridian with a gaussian valley; the groove is darkened via vertex colours. The whole
  swarm is a single `InstancedMesh`.
- **Gold ribbons & milk pour** — flat ribbons swept along Catmull-Rom curves using
  Frenet frames, with per-`t` width taper and a twist that rolls the cross-section
  around the tangent so they fold and catch light.
- **Steam & gold dust** — GLSL point clouds. All motion lives in the vertex shader, so
  the CPU only pushes a time uniform per frame.
- **Environment** — a local cube map baked once from `<Lightformer>` cards (key, gold
  rim, cool edge, ground bounce) instead of fetching a preset HDRI.
- **Backdrop** — a camera-locked billboard that gives the transmission pass something
  real to refract; without it the glass would bend empty alpha.

## Motion architecture

Pointer and scroll are written imperatively into `src/lib/sceneState.ts` and read inside
`useFrame`. Scrolling the hero never re-renders React — it only moves values the render
loop already samples. `useHeroScroll` feeds ScrollTrigger progress into that same object.

Quality degrades automatically: phones and tablets get simpler transmission, fewer
particles, and no post-processing, and drei's `PerformanceMonitor` drops a struggling
desktop into the same tier. `prefers-reduced-motion` switches the canvas to
`frameloop="demand"` and skips the entrance and pointer tracking entirely.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

## Project structure

```text
src/
  components/scene/       WebGL layer
    CoffeeCanvas.tsx      canvas, environment, lights, post-processing, quality tiers
    Rig.tsx               pointer parallax + scroll dolly
    GlassMug.tsx  Pedestal.tsx  Beans.tsx  IceCubes.tsx
    GoldRibbons.tsx  MilkSwirl.tsx  Steam.tsx  GoldDust.tsx  Backdrop.tsx
  components/site/        DOM layer
    AnnouncementBar.tsx  SiteHeader.tsx  Hero.tsx  Marquee.tsx
    CollectionSection.tsx  RitualSection.tsx  SiteFooter.tsx
  components/motion/      Reveal + SplitHeading scroll reveals
  lib/three/              geometry.ts, textures.ts — runtime generation
  lib/sceneState.ts       pointer/scroll/entrance bridge
  config/site.ts          all page copy
```

## Notes

- `useScrolledPast` uses an IntersectionObserver sentinel rather than a `scroll`
  listener. Lenis moves the page programmatically, so native scroll events are not a
  dependable signal.
- Avoid putting `overflow` on a section that contains a `sticky` child — it silently
  disables the stickiness. `RitualSection` clips its decorative glow in a nested
  wrapper for this reason.
