import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { site } from '@/config/site'
import { useHeroScroll } from '@/hooks/useHeroScroll'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Split out so Three.js stays out of the initial bundle — the hero's copy and
 * gradient paint immediately while the WebGL stage streams in behind it.
 */
const CoffeeCanvas = lazy(() =>
  import('@/components/scene/CoffeeCanvas').then((m) => ({ default: m.CoffeeCanvas })),
)

/**
 * Out-of-focus beans in the DOM layer. Cheaper than depth-of-field on the
 * WebGL pass and gives the same foreground bokeh as the reference.
 */
const FOREGROUND_BEANS = [
  { className: 'left-[-2%] bottom-[4%] w-[9vw] max-w-[112px] rotate-[18deg]', blur: 9, opacity: 0.5, drift: 18 },
  { className: 'left-[8%] bottom-[26%] w-[4.5vw] max-w-[58px] rotate-[-24deg]', blur: 5, opacity: 0.4, drift: -14 },
  { className: 'right-[-1%] bottom-[10%] w-[7.5vw] max-w-[92px] rotate-[-8deg]', blur: 10, opacity: 0.45, drift: 22 },
  { className: 'right-[12%] top-[16%] w-[3.5vw] max-w-[46px] rotate-[34deg]', blur: 4, opacity: 0.32, drift: -20 },
]

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const beansRef = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useHeroScroll(sectionRef)

  // Entrance choreography — copy rises while the 3D stage settles in behind it.
  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('[data-hero-line]', {
          yPercent: 118,
          duration: 1.15,
          stagger: 0.09,
        })
        .from(
          '[data-hero-fade]',
          { opacity: 0, y: 26, duration: 1, stagger: 0.08 },
          '-=0.75',
        )
        .from(
          '[data-hero-aside]',
          { opacity: 0, x: 40, duration: 1.05 },
          '-=0.85',
        )
        .from(
          '[data-hero-bean]',
          { opacity: 0, scale: 0.75, duration: 1.4, stagger: 0.1 },
          '-=1.1',
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  // Idle drift on the blurred foreground beans.
  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-hero-bean]').forEach((bean, index) => {
        gsap.to(bean, {
          y: FOREGROUND_BEANS[index]?.drift ?? 16,
          rotation: `+=${index % 2 === 0 ? 6 : -8}`,
          duration: 7 + index * 1.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    }, beansRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  useEffect(() => {
    const id = window.setInterval(
      () => setSlide((current) => (current + 1) % site.hero.slides.length),
      4200,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[radial-gradient(120%_90%_at_50%_35%,#f8eddc_0%,#e7cfae_42%,#c49a6b_74%,#9a7048_100%)]"
    >
      {/* r3f sets position:relative inline on its own wrapper, so the stage gets
          its own absolutely-positioned host instead of a className override. */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <CoffeeCanvas />
        </Suspense>
      </div>

      {/* Depth haze so the DOM copy separates from the 3D stage. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(75%_60%_at_50%_45%,transparent_35%,rgba(122,86,50,0.26)_100%)]" />
      {/* Side scrims — lift the copy columns off the busiest part of the render. */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(90deg,rgba(248,238,222,0.62)_0%,rgba(248,238,222,0.18)_26%,transparent_42%,transparent_58%,rgba(248,238,222,0.2)_76%,rgba(248,238,222,0.58)_100%)] lg:block" />
      {/* Portrait stacks copy over stage, so the scrim runs top-down instead. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(248,238,222,0.82)_0%,rgba(248,238,222,0.5)_34%,transparent_58%)] lg:hidden" />

      <div ref={beansRef} className="pointer-events-none absolute inset-0 z-20">
        {FOREGROUND_BEANS.map((bean, index) => (
          <img
            key={index}
            data-hero-bean
            src="/assets/coffee/bean.png"
            alt=""
            aria-hidden
            className={`absolute ${bean.className}`}
            style={{
              filter: `blur(${bean.blur}px) saturate(1.05)`,
              opacity: bean.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-30 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col px-5 pt-30 pb-8 md:px-8 lg:pt-36 lg:pb-10">
        <div className="grid flex-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div ref={copyRef} className="max-w-md">
            <div data-hero-fade className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.4em] text-mocha uppercase">
                {site.hero.eyebrow}
              </span>
            </div>

            <h1 className="font-display text-espresso text-[clamp(2.6rem,7.5vw,6.5rem)] leading-[0.92] font-light tracking-[-0.02em]">
              {site.hero.headline.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block">
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-hero-fade
              className="text-espresso/70 mt-5 max-w-sm text-[14px] leading-relaxed lg:mt-7 lg:text-[15px]"
            >
              {site.hero.body}
            </p>

            <div data-hero-fade className="mt-7 lg:mt-9">
              <a
                href="#collection"
                className="group inline-flex items-center gap-3 rounded-full border border-espresso/25 px-8 py-3.5 text-[11px] tracking-[0.24em] text-espresso uppercase transition-colors duration-500 hover:border-gold hover:bg-espresso hover:text-cream"
              >
                {site.hero.primaryCta}
                <svg viewBox="0 0 20 8" className="h-2 w-5 overflow-visible" fill="none" stroke="currentColor">
                  <path
                    d="M0 4h18M14.5 0.5 18.5 4l-4 3.5"
                    strokeWidth="1"
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Centre column stays empty on desktop — the WebGL cup lives there. */}
          <div className="hidden lg:block" aria-hidden />

          {/* Portrait has no room beside the stage — this copy also lives in the
              collection section, so it is desktop-only. */}
          <div
            ref={asideRef}
            data-hero-aside
            className="hidden max-w-xs lg:ml-auto lg:block lg:text-right"
          >
            <span className="text-[10px] tracking-[0.36em] text-mocha uppercase">
              {site.hero.aside.label}
            </span>
            <h2 className="font-display text-espresso mt-4 text-2xl leading-snug font-light md:text-[28px]">
              {site.hero.aside.title}
            </h2>
            <p className="text-espresso/65 mt-4 text-[13px] leading-relaxed">
              {site.hero.aside.body}
            </p>
            <a
              href="#collection"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-light to-gold px-6 py-2.5 text-[10px] tracking-[0.22em] text-espresso uppercase shadow-[0_12px_30px_-14px_rgba(150,105,40,0.95)] transition-transform duration-400 hover:-translate-y-0.5"
            >
              {site.hero.aside.cta}
            </a>
          </div>
        </div>

        <div data-hero-fade className="mt-8 flex flex-col items-center gap-4 lg:mt-10 lg:gap-6">
          <div className="flex items-center gap-3">
            {site.hero.slides.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                aria-current={index === slide}
                onClick={() => setSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === slide ? 'w-8 bg-espresso/80' : 'w-1.5 bg-espresso/25 hover:bg-espresso/45'
                }`}
              />
            ))}
          </div>

          <a
            href="#collection"
            className="rounded-full border border-espresso/25 bg-cream/25 px-10 py-3 text-[11px] tracking-[0.26em] text-espresso uppercase backdrop-blur-sm transition-colors duration-500 hover:bg-espresso hover:text-cream"
          >
            {site.hero.primaryCta}
          </a>

          <span className="text-[10px] tracking-[0.3em] text-espresso/60 uppercase">
            {site.hero.slides[slide]}
          </span>
        </div>
      </div>
    </section>
  )
}
