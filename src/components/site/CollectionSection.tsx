import { Reveal, SplitHeading } from '@/components/motion'
import { site } from '@/config/site'

export function CollectionSection() {
  const { eyebrow, title, body, items } = site.collection

  return (
    <section
      id="collection"
      className="relative bg-[linear-gradient(180deg,#f8efe1_0%,#efdfc7_55%,#e6d0b1_100%)] px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Reveal duration={0.85}>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                <span className="text-[10px] tracking-[0.4em] text-mocha uppercase">{eyebrow}</span>
              </div>
            </Reveal>
            <SplitHeading className="font-display text-espresso text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.05] font-light tracking-[-0.015em]">
              {title}
            </SplitHeading>
          </div>
          <Reveal delay={0.1} duration={0.95}>
            <p className="text-espresso/65 max-w-sm text-[15px] leading-relaxed">{body}</p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const cover = 'imageFit' in item && item.imageFit === 'cover'
            const position =
              'imagePosition' in item && item.imagePosition === 'center'
                ? 'object-center'
                : 'object-[center_30%]'

            return (
            <Reveal key={item.name} delay={index * 0.08} duration={0.95}>
              <article className="group relative overflow-hidden rounded-[26px] border border-espresso/10 bg-cream/55 backdrop-blur-sm transition-[transform,box-shadow] duration-600 hover:-translate-y-2 hover:shadow-[0_40px_80px_-50px_rgba(70,40,15,0.85)]">
                <div
                  className={
                    cover
                      ? 'relative h-72 overflow-hidden bg-black'
                      : 'relative flex h-64 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#f3e2cb_0%,#dcbf98_65%,#c1996d_100%)]'
                  }
                >
                  <span
                    className={
                      cover
                        ? 'absolute top-5 right-5 z-10 rounded-full border border-cream/25 bg-black/35 px-3 py-1 text-[10px] tracking-[0.2em] text-cream/90 uppercase backdrop-blur-sm'
                        : 'absolute top-5 right-5 rounded-full border border-espresso/15 px-3 py-1 text-[10px] tracking-[0.2em] text-espresso/70 uppercase'
                    }
                  >
                    {item.price}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className={
                      cover
                        ? `h-full w-full object-cover ${position} transition-transform duration-700 group-hover:scale-[1.05]`
                        : 'max-h-[74%] w-auto object-contain drop-shadow-[0_28px_38px_rgba(80,45,15,0.42)] transition-transform duration-700 group-hover:scale-[1.07]'
                    }
                  />
                </div>

                <div className="p-7">
                  <span className="text-[10px] tracking-[0.28em] text-mocha uppercase">
                    {item.origin}
                  </span>
                  <h3 className="font-display text-espresso mt-3 text-2xl font-normal">{item.name}</h3>
                  <p className="text-espresso/75 mt-2 text-[13px] tracking-[0.04em]">{item.note}</p>

                  <div className="mt-7 flex items-center justify-between border-t border-espresso/10 pt-5">
                    <span className="text-[11px] tracking-[0.2em] text-espresso/70 uppercase">
                      Add to cart
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-espresso/20 text-espresso transition-colors duration-500 group-hover:border-gold group-hover:bg-gold">
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.3">
                        <path d="M8 2v12M2 8h12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
