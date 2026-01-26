import { Metadata } from 'next'
import Image from 'next/image'
import { VideoListing } from '@/components/video/VideoListing'
import { getEvaExplainsVideos } from '@/lib/supabase/video'
import { PlayCircle, Sparkles, Headphones } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ева Объясняет | Без |Паузы',
  description: 'Образовательные видео о менопаузе от AI-ассистента Евы. Простые объяснения сложных тем о здоровье женщин 40+.',
  keywords: ['Ева объясняет', 'видео менопауза', 'образовательные видео', 'менопауза видео', 'AI ассистент'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/videos/eva-explains`,
  },
  openGraph: {
    title: 'Ева Объясняет | Без |Паузы',
    description: 'Образовательные видео о менопаузе от AI-ассистента Евы. Простые объяснения сложных тем о здоровье женщин 40+.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/videos/eva-explains`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default async function EvaExplainsPage() {
  const { data: videos, error } = await getEvaExplainsVideos()

  return (
    <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-ocean-wave-start via-ocean-wave-end to-warm-accent py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full mb-6 overflow-hidden ring-4 ring-white/40 shadow-xl bg-white/10 backdrop-blur-sm">
                <Image
                  src="/ChatGPT Image Dec 19, 2025 at 10_44_36 PM.png"
                  alt="Ева"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <h1 className="text-h1 md:text-display font-bold text-white mb-6">
                Ева Объясняет
              </h1>
              <p className="text-body-large text-white/90 leading-relaxed mb-8">
                Образовательные видео о менопаузе от AI-ассистента Евы. Простые объяснения сложных тем о здоровье женщин 40+.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-body-small text-white/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Научно обоснованные объяснения</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Type Selection */}
        <section className="py-12 bg-soft-white border-b border-lavender-bg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/videos/eva-explains"
                  className="px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 bg-lavender-bg text-deep-navy hover:bg-primary-purple/10"
                >
                  <PlayCircle className="w-4 h-4" />
                  Все видео
                </Link>
                <Link
                  href="/podcasts/nopause"
                  className="px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 bg-lavender-bg text-deep-navy hover:bg-primary-purple/10"
                >
                  <Headphones className="w-4 h-4" />
                  noPause подкасты
                </Link>
                <Link
                  href="/videos/eva-explains"
                  className="px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 bg-ocean-wave-start text-white hover:bg-ocean-wave-start/90"
                >
                  <Sparkles className="w-4 h-4" />
                  Ева объясняет
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Videos Section */}
        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <VideoListing initialVideos={videos || []} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-ocean-wave-start/5">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-h2 font-bold text-deep-navy mb-4">
              Нужна более подробная информация?
            </h2>
            <p className="text-body text-deep-navy/70 mb-8 max-w-2xl mx-auto">
              Задайте вопрос AI-ассистенту Еве или прочитайте научные статьи в нашем журнале
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/bot"
                className="inline-block px-8 py-4 bg-gradient-primary text-soft-white rounded-full font-semibold hover:shadow-button-hover transition-all duration-300"
              >
                Задать вопрос Еве
              </Link>
              <Link
                href="/blog"
                className="inline-block px-8 py-4 bg-transparent text-ocean-wave-start border-2 border-ocean-wave-start rounded-full font-semibold hover:bg-ocean-wave-start hover:text-white transition-all duration-300"
              >
                Читать журнал
              </Link>
            </div>
          </div>
        </section>
    </div>
  )
}

