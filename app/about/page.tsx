import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export const metadata: Metadata = {
  title: 'О нас — Без |Паузы',
  description: 'Узнайте больше о платформе Без |Паузы и нашей миссии помочь женщинам в период менопаузы.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent/30 text-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6">
                О нас
              </h1>
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed">
                Наша миссия — помочь каждой женщине пройти через менопаузу с уверенностью и знаниями
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 text-body text-deep-navy/80 leading-relaxed">
              <p>
                Без |Паузы — это премиальная образовательная платформа для женщин 40+ в период менопаузы.
                Мы объединяем научные знания, экспертизу врачей и современные технологии, чтобы помочь
                вам понять, что происходит с вашим телом, и принять обоснованные решения о здоровье.
              </p>
              <p>
                Наша команда состоит из гинекологов, маммологов, нутрициологов и других специалистов,
                которые специализируются на женском здоровье в период менопаузы. Мы верим, что каждая
                женщина заслуживает доступа к качественной информации и поддержке.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AskEvaWidget />
    </>
  )
}
