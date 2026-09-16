import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Init Lenis once and drive it from GSAP's ticker so ScrollTrigger stays synced.
 * Call from a top-level layout/provider only.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(ticker)
    // Keep default lag smoothing so a WebGL compile hitch doesn't make Lenis /
    // ScrollTrigger try to "catch up" and feel like a jumpy load.
    gsap.ticker.lagSmoothing(500, 33)

    return () => {
      gsap.ticker.remove(ticker)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [enabled])
}
