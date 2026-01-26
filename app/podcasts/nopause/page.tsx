import { Metadata } from 'next'
import { PodcastListing } from '@/components/video/PodcastListing'
import { getPodcastEpisodes } from '@/lib/supabase/video'
import { Headphones, Radio, PlayCircle, Sparkles, Video } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Подкаст noPause | Без |Паузы',
  description: 'Подкаст о менопаузе, здоровье и жизни после 40. Беседы с экспертами, истории женщин и научно обоснованные советы.',
  keywords: ['подкаст менопауза', 'noPause подкаст', 'менопауза подкаст', 'женское здоровье подкаст'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/podcasts/nopause`,
  },
  openGraph: {
    title: 'Подкаст noPause | Без |Паузы',
    description: 'Подкаст о менопаузе, здоровье и жизни после 40. Беседы с экспертами, истории женщин и научно обоснованные советы.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/podcasts/nopause`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default async function NoPausePodcastPage() {
  const { data: episodes, error } = await getPodcastEpisodes()

  return (
    <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-purple via-ocean-wave-start to-ocean-wave-end py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Headphones className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-h1 md:text-display font-bold text-white mb-6">
                Подкаст noPause
              </h1>
              <p className="text-body-large text-white/90 leading-relaxed mb-8">
                Беседы о менопаузе, здоровье и жизни после 40. Эксперты, истории женщин и научно обоснованные советы.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-body-small text-white/80">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  <span>Доступно на YouTube и Mave</span>
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
                  className="px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 bg-primary-purple text-white hover:bg-primary-purple/90"
                >
                  <Headphones className="w-4 h-4" />
                  noPause подкасты
                </Link>
                <Link
                  href="/videos/eva-explains"
                  className="px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 bg-lavender-bg text-deep-navy hover:bg-primary-purple/10"
                >
                  <Sparkles className="w-4 h-4" />
                  Ева объясняет
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FemTech Force Podcast Video */}
        <section className="py-16 md:py-24 bg-lavender-bg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-bold text-deep-navy">
                      Подкаст FemTech Force
                    </h2>
                    <p className="text-body-small text-deep-navy/60">
                      Интервью с Ольгой Пучковой
                    </p>
                  </div>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-deep-navy/5 mb-4">
                  <iframe
                    src="https://femtechforce.mave.digital/ep-51"
                    title="Подкаст FemTech Force с Ольгой Пучковой"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-body-small text-deep-navy/60 text-center">
                  О женском здоровье, маммологии и важности регулярных обследований
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Episodes Section */}
        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <PodcastListing initialEpisodes={episodes || []} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-lavender-bg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-h2 font-bold text-deep-navy mb-4">
              Хотите задать вопрос?
            </h2>
            <p className="text-body text-deep-navy/70 mb-8 max-w-2xl mx-auto">
              Задайте вопрос AI-ассистенту Еве — она ответит на ваши вопросы о менопаузе и здоровье
            </p>
            <Link
              href="/bot"
              className="inline-block px-8 py-4 bg-gradient-primary text-soft-white rounded-full font-semibold hover:shadow-button-hover transition-all duration-300"
            >
              Задать вопрос Еве
            </Link>
          </div>
        </section>
    </div>
  )
}

