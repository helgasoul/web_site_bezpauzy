import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BlogListing } from '@/components/blog/BlogListing'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export const metadata: Metadata = {
  title: 'Журнал — Статьи о менопаузе | Без |Паузы',
  description: 'Научно обоснованные статьи о менопаузе от гинекологов, маммологов и нутрициологов.',
  keywords: ['статьи', 'менопауза', 'журнал', 'здоровье', 'гинеколог', 'маммолог', 'нутрициолог'],
  openGraph: {
    title: 'Журнал — Статьи о менопаузе',
    description: 'Научно обоснованные статьи о менопаузе',
    type: 'website',
  },
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat text-deep-navy mb-6">
                Журнал
              </h1>
              <p className="text-xl md:text-2xl text-deep-navy/80 leading-relaxed">
                Научно обоснованные статьи о менопаузе от экспертов
              </p>
            </div>
          </div>
        </section>

        <BlogListing />
      </main>
      <Footer />
      <AskEvaWidget />
    </>
  )
}
