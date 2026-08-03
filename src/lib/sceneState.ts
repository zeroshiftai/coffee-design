/**
 * Mutable bridge between DOM-driven input (pointer, Lenis/ScrollTrigger) and the
 * r3f render loop. Written imperatively so scroll and pointer never trigger React
 * re-renders — `useFrame` reads it directly each tick.
 */
export type SceneState = {
  /** Pointer x in -1..1, raw (undamped). */
  pointerX: number
  /** Pointer y in -1..1, raw (undamped). */
  pointerY: number
  /** Hero scroll progress 0..1 (0 = hero pinned at top, 1 = hero scrolled past). */
  scroll: number
  /** Intro choreography progress 0..1, driven by GSAP once the scene is ready. */
  entrance: number
}

export const sceneState: SceneState = {
  pointerX: 0,
  pointerY: 0,
  scroll: 0,
  entrance: 0,
}
