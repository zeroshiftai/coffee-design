import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from '@/lib/sceneState'

gsap.registerPlugin(ScrollTrigger)

/**
 * Feeds the hero's scroll progress into `sceneState` so the WebGL layer can
 * dolly, disperse, and fade without React re-rendering on every scroll tick.
 */
export function useHeroScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        sceneState.scroll = self.progress
      },
    })

    return () => {
      trigger.kill()
      sceneState.scroll = 0
    }
  }, [ref])
}
