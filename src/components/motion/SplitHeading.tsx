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
import SplitType from 'split-type'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

type SplitHeadingOwnProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  className?: string
  /** Stagger between lines (default 0.05s). */
  stagger?: number
  /** Duration per line — clamped to 0.8–1.2s. */
  duration?: number
}

type SplitHeadingProps<T extends ElementType> = SplitHeadingOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SplitHeadingOwnProps<T>>

const MIN_DURATION = 0.8
const MAX_DURATION = 1.2

/**
 * Scroll-revealed heading split by line via split-type.
 * Lines fade + rise with a 0.05s stagger. Skips when reduced motion is preferred.
 */
export function SplitHeading<T extends ElementType = 'h2'>({
  as,
  children,
  className,
  stagger = 0.05,
  duration = 1,
  ...rest
}: SplitHeadingProps<T>) {
  // Cast through a permissive component type: r3f augments JSX.IntrinsicElements,
  // so a bare `ElementType` widens into a union JSX can no longer resolve props for.
  const Tag = (as ?? 'h2') as unknown as ComponentType<Record<string, unknown>>
  const ref = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const tweenDuration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration))

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion) return

    const split = new SplitType(el, {
      types: 'lines',
      lineClass: 'split-line',
    })

    const lines = split.lines ?? []
    if (!lines.length) {
      split.revert()
      return
    }

    // Wrap each line for overflow clip so the rise feels clean
    lines.forEach((line) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'split-line-mask'
      wrapper.style.overflow = 'hidden'
      line.parentNode?.insertBefore(wrapper, line)
      wrapper.appendChild(line)
    })

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        {
          opacity: 0,
          y: 40,
          willChange: 'transform, opacity',
        },
        {
          opacity: 1,
          y: 0,
          duration: tweenDuration,
          stagger,
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
      split.revert()
    }
  }, [children, prefersReducedMotion, stagger, tweenDuration])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
