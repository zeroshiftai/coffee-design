import {
  AnnouncementBar,
  CollectionSection,
  Hero,
  Marquee,
  RitualSection,
  SiteFooter,
  SiteHeader,
} from '@/components/site'

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-espresso antialiased">
      {/* Chrome floats over the hero the way it does in the reference. */}
      <div className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBar />
        <SiteHeader />
      </div>

      <main>
        <Hero />
        <Marquee />
        <CollectionSection />
        <RitualSection />
      </main>
      <SiteFooter />
    </div>
  )
}
