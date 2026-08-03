import { site } from '@/config/site'

/** Infinite gold marquee bridging the hero and the collection. */
export function Marquee() {
  const items = [...site.marquee, ...site.marquee]

  return (
    <div className="relative z-30 overflow-hidden border-y border-espresso/10 bg-espresso py-4">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-[15px] tracking-[0.28em] text-cream/85 uppercase">
              {item}
            </span>
            <span className="size-1.5 rotate-45 bg-gold" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}
