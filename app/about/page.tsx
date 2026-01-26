import type { Metadata } from 'next'
import Image from 'next/image'
import { BackButton } from '@/components/ui/BackButton'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import { PenTool, GraduationCap, Microscope, Video } from 'lucide-react'
import { assetUrl } from '@/lib/assets'

export const metadata: Metadata = {
  title: 'О нас — Кто мы | Без |Паузы',
  description: 'Узнайте больше о создателе платформы Без |Паузы и нашей миссии помочь женщинам 40+ в период менопаузы.',
  keywords: ['о нас', 'создатель', 'менопауза', 'женское здоровье', 'команда'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/about`,
  },
  openGraph: {
    title: 'О нас — Кто мы',
    description: 'Узнайте больше о создателе платформы Без |Паузы',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/about`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function AboutPage() {
  return (
    <>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-purple-ocean text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-purple rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-ocean-wave-start rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto mb-6">
              <BackButton variant="outline" />
            </div>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold font-montserrat mb-6 drop-shadow-lg">
                О нас
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Наша миссия — поддержать вас в период менопаузы научно обоснованной информацией и заботой
              </p>
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Photo */}
                <div className="relative">
                  <div className="relative w-full aspect-square max-w-md mx-auto rounded-card overflow-hidden shadow-strong">
                    <Image
                      src={assetUrl('/Для bloom.jpg')}
                      alt="Создатель платформы Без |Паузы"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/20 to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <h2 className="text-h2 font-bold text-deep-navy">
                    Кто мы
                  </h2>
                  <div className="space-y-4 text-body text-deep-navy/80">
                    <p>
                      Меня зовут <strong className="text-primary-purple">Ольга Пучкова</strong>, и я создала платформу <strong className="text-primary-purple">Без |Паузы</strong> с глубоким пониманием того, через что проходят женщины в период менопаузы. Я знаю, как важно иметь доступ к научно обоснованной информации, поддержке и пониманию.
                    </p>
                    <p>
                      Я — специалист с медицинским образованием и многолетним опытом работы в области женского здоровья. Столкнувшись с недостатком качественной информации о менопаузе на русском языке, я решила создать платформу, которая объединяет науку, заботу и практическую поддержку.
                    </p>
                    <p>
                      Я верю, что каждая женщина заслуживает понимания своего тела, доступа к лучшим специалистам и поддержки на каждом этапе этого важного жизненного пути. <strong className="text-primary-purple">Ваша энергия — без паузы.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interviews & Media Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
                Интервью и публикации
              </h2>
              <p className="text-body-large text-deep-navy/70 text-center max-w-2xl mx-auto mb-12">
                Ольга Пучкова регулярно выступает в СМИ и участвует в экспертных обсуждениях о женском здоровье, маммологии и менопаузе
              </p>

              {/* Interviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <a
                  href="https://snob.ru/profile/32128/blog/1007545/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-card p-6 border-2 border-lavender-bg hover:border-primary-purple hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PenTool className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-h6 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors line-clamp-2">
                        Блог на Snob.ru
                      </h3>
                      <p className="text-body-small text-deep-navy/60 mb-3">
                        Snob.ru
                      </p>
                      <span className="text-body-small text-primary-purple font-medium group-hover:underline">
                        Читать →
                      </span>
                    </div>
                  </div>
                </a>

                <a
                  href="https://news.itmo.ru/ru/news/13518/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-card p-6 border-2 border-lavender-bg hover:border-primary-purple hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-h6 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors line-clamp-2">
                        Интервью для ИТМО
                      </h3>
                      <p className="text-body-small text-deep-navy/60 mb-3">
                        Новости ИТМО
                      </p>
                      <span className="text-body-small text-primary-purple font-medium group-hover:underline">
                        Читать →
                      </span>
                    </div>
                  </div>
                </a>

                <a
                  href="https://t-j.ru/list/mammography/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-card p-6 border-2 border-lavender-bg hover:border-primary-purple hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Microscope className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-h6 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors line-clamp-2">
                        Маммография: важность обследования
                      </h3>
                      <p className="text-body-small text-deep-navy/60 mb-3">
                        T-J.ru
                      </p>
                      <span className="text-body-small text-primary-purple font-medium group-hover:underline">
                        Читать →
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              {/* Video Section */}
              <div className="bg-gradient-to-br from-primary-purple/5 via-ocean-wave-start/5 to-warm-accent/5 rounded-card p-8 border-2 border-primary-purple/10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-lg flex items-center justify-center shadow-medium">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                      Подкаст FemTech Force
                    </h3>
                    <p className="text-body text-deep-navy/70 mb-4">
                      Интервью с Ольгой Пучковой о женском здоровье, маммологии и важности регулярных обследований
                    </p>
                    <a
                      href="https://femtechforce.mave.digital/ep-51"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white rounded-full font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300"
                    >
                      <span>Смотреть видео</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 bg-lavender-bg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
                Наша миссия
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-medium">
                    <span className="text-3xl">🔬</span>
                  </div>
                  <h3 className="text-h4 font-semibold text-deep-navy">
                    Научный подход
                  </h3>
                  <p className="text-body text-deep-navy/70">
                    Вся информация основана на актуальных медицинских исследованиях и рекомендациях ведущих специалистов
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-medium">
                    <span className="text-3xl">💜</span>
                  </div>
                  <h3 className="text-h4 font-semibold text-deep-navy">
                    С заботой
                  </h3>
                  <p className="text-body text-deep-navy/70">
                    Мы понимаем, что менопауза — это не просто медицинский процесс, а важный жизненный этап
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-medium">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-h4 font-semibold text-deep-navy">
                    Поддержка 24/7
                  </h3>
                  <p className="text-body text-deep-navy/70">
                    AI-ассистент Ева всегда готова ответить на ваши вопросы и поддержать вас в любое время
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-h2 font-bold text-white">
                Свяжитесь с нами
              </h2>
              <p className="text-body-large text-white/90">
                У вас есть вопросы или предложения? Мы всегда рады услышать от вас
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:bez-pauzy@yandex.com"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-purple rounded-full font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300"
                >
                  Написать нам
                </a>
                <a
                  href="https://t.me/bezpauzy_bot?start=website_about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </section>
      <AskEvaWidget />
    </>
  )
}

