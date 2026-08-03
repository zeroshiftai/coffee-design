import { site } from '@/config/site'
import { useScrolledPast } from '@/hooks/useScrolledPast'

/** Overlay nav that condenses into a frosted bar once the hero starts moving. */
export function SiteHeader() {
  const condensed = useScrolledPast(40)

  return (
    <header
      className={`relative z-40 transition-[background-color,backdrop-filter,border-color,padding] duration-500 ${
        condensed
          ? 'border-b border-espresso/10 bg-cream/92 py-3 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#home" className="shrink-0 leading-none">
          <span className="font-display block text-2xl tracking-[0.04em] text-espresso md:text-[26px]">
            {site.brand.name}
          </span>
          {site.brand.sub ? (
            <span className="mt-1 block text-[9px] tracking-[0.42em] text-mocha uppercase">
              {site.brand.sub}
            </span>
          ) : null}
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {site.nav.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`group relative text-[12px] tracking-[0.14em] uppercase transition-colors ${
                index === 0 ? 'text-espresso' : 'text-espresso/60 hover:text-espresso'
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-400 ${
                  index === 0 ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            aria-label="Search"
            className="grid size-9 place-items-center rounded-full border border-espresso/15 text-espresso/70 transition-colors hover:border-gold hover:text-espresso"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.2 13.2 3.3 3.3" strokeLinecap="round" />
            </svg>
          </button>

          <a
            href="#collection"
            className="group relative overflow-hidden rounded-full border border-gold/50 bg-gradient-to-r from-gold-light to-gold px-5 py-2.5 text-[11px] tracking-[0.18em] whitespace-nowrap text-espresso uppercase shadow-[0_10px_30px_-12px_rgba(150,105,40,0.9)] transition-transform duration-400 hover:-translate-y-0.5 md:px-7"
          >
            <span className="relative z-10">Order Online</span>
            <span className="absolute inset-0 -translate-x-full bg-cream/45 transition-transform duration-600 group-hover:translate-x-0" />
          </a>
        </div>
      </div>
    </header>
  )
}
