import { type ReactNode } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type SmoothScrollProviderProps = {
  children: ReactNode
}

/**
 * Top-level Lenis smooth-scroll provider.
 * Syncs Lenis to GSAP's ticker so ScrollTrigger stays in sync.
 * Skips entirely when prefers-reduced-motion is set.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  useLenis(!prefersReducedMotion)
  return children
}
