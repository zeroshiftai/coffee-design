import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Reveal, SplitHeading } from '@/components/motion'
import { site } from '@/config/site'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export function RitualSection() {
  const { eyebrow, title, body, steps } = site.ritual
  const ref = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // The gold rule fills as the steps scroll past — a small scrubbed accent.
  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-ritual-rule]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: '[data-ritual-list]',
            start: 'top 78%',
            end: 'bottom 65%',
            scrub: 0.6,
          },
        },
      )
    }, ref)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      ref={ref}
      id="ritual"
      className="relative bg-espresso px-5 py-24 text-cream md:px-8 md:py-32"
    >
      {/* The glow is clipped by its own wrapper — `overflow` on the section
          itself would disable the sticky column below. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(200,155,75,0.32)_0%,transparent_68%)] blur-2xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal duration={0.85}>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.4em] text-gold-light uppercase">{eyebrow}</span>
            </div>
          </Reveal>
          <SplitHeading className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.05] font-light tracking-[-0.015em] text-cream">
            {title}
          </SplitHeading>
          <Reveal delay={0.1} duration={0.95}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cream/60">{body}</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-cream/12 pt-8">
            {site.stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.07} duration={0.9}>
                <div>
                  <div className="font-display text-3xl font-light text-gold-light md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[10px] tracking-[0.24em] text-cream/45 uppercase">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div data-ritual-list className="relative pl-10 md:pl-14">
          <span className="absolute top-2 left-[3px] h-[calc(100%-1rem)] w-px bg-cream/12" aria-hidden />
          <span
            data-ritual-rule
            className="absolute top-2 left-[3px] h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-gold-light to-gold"
            aria-hidden
          />

          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06} duration={0.95}>
              <div className="relative border-b border-cream/10 py-9 last:border-b-0">
                <span
                  className="absolute top-[2.9rem] -left-10 size-[9px] rounded-full border border-gold bg-espresso md:-left-14"
                  aria-hidden
                />
                <div className="mb-3 text-[10px] tracking-[0.3em] text-gold-light/70 uppercase">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-3xl font-light md:text-[38px]">{step.title}</h3>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-cream/55">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
