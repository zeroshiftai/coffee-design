import { useMediaQuery } from './useMediaQuery'

/** True when the user prefers reduced motion (system accessibility setting). */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
