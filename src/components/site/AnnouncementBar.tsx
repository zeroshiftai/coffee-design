import { site } from '@/config/site'

/** Thin dark strip above the header, mirroring the reference layout. */
export function AnnouncementBar() {
  return (
    <div className="relative z-50 bg-espresso/95 text-cream/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-8 px-5 py-2 text-[10px] tracking-[0.22em] uppercase md:justify-between md:px-8">
        <span className="hidden md:inline">{site.announcements[0]}</span>
        <span className="text-center">{site.announcements[1]}</span>
        <span className="hidden md:inline">{site.announcements[2]}</span>
      </div>
    </div>
  )
}
