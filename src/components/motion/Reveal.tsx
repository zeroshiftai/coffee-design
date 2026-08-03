import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

type RevealOwnProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  /** Delay before the reveal starts (seconds). */
  delay?: number
  /** Duration in seconds — clamped to the project range 0.8–1.2. */
  duration?: number
  /** Extra y offset in px (default 40). */
  y?: number
  className?: string
}

type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>

const MIN_DURATION = 0.8
const MAX_DURATION = 1.2

/**
 * Reusable scroll reveal: fade + translateY → 0 on enter.
 * start: "top 85%", once: true, ease: power3.out.
 * Skips when prefers-reduced-motion is set.
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  children,
  delay = 0,
  duration = 1,
  y = 40,
  className,
  style,
  ...rest
}: RevealProps<T>) {
  // Cast through a permissive component type: r3f augments JSX.IntrinsicElements,
  // so a bare `ElementType` widens into a union JSX can no longer resolve props for.
  const Tag = (as ?? 'div') as unknown as ComponentType<Record<string, unknown>>
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const tweenDuration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration))

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y,
          willChange: 'transform, opacity',
        },
        {
          opacity: 1,
          y: 0,
          duration: tweenDuration,
          delay,
          ease: 'power3.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: el,
            start: 'clamp(top 85%)',
            once: true,
          },
        },
      )
    }, el)

    return () => {
      ctx.revert()
    }
  }, [delay, prefersReducedMotion, tweenDuration, y])

  const initialStyle = prefersReducedMotion
    ? style
    : {
        opacity: 0,
        transform: `translate3d(0, ${y}px, 0)`,
        ...style,
      }

  return (
    <Tag ref={ref} className={className} style={initialStyle} {...rest}>
      {children}
    </Tag>
  )
}
