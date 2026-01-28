import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import { BackButton } from '@/components/ui/BackButton'
import { getTopicBySlug } from '@/lib/knowledge-base/config'
import { TopicArticles } from '@/components/knowledge-base/TopicArticles'
import { TopicQuizzes } from '@/components/knowledge-base/TopicQuizzes'
import { TopicPodcasts } from '@/components/knowledge-base/TopicPodcasts'
import { TopicGuides } from '@/components/knowledge-base/TopicGuides'
import { TopicChecklists } from '@/components/knowledge-base/TopicChecklists'
import { TopicVideos } from '@/components/knowledge-base/TopicVideos'
import { TopicContent } from '@/components/knowledge-base/TopicContent'
import { InteractiveCards } from '@/components/knowledge-base/InteractiveCards'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface TopicPageProps {
  params: {
    category: string
    topic: string
  }
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topicData = getTopicBySlug(params.topic, params.category)
  
  if (!topicData) {
    return {
      title: 'Тема не найдена | Без |Паузы',
    }
  }

  // topicData имеет структуру: { ...topic, category }
  // Все поля topic находятся в корне объекта
  // category может быть undefined, поэтому используем optional chaining
  return {
    title: `${topicData.title}${topicData.category ? ` | ${topicData.category.title}` : ''} | Без |Паузы`,
    description: topicData.description,
    openGraph: {
      title: `${topicData.title} | База знаний`,
      description: topicData.description,
      type: 'website',
    },
  }
}

export default function TopicPage({ params }: TopicPageProps) {
  const topicData = getTopicBySlug(params.topic, params.category)

  if (!topicData || !topicData.category) {
    notFound()
  }

  // topicData имеет структуру: { ...topic, category }
  // Все поля topic находятся в корне объекта
  const { category } = topicData

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8">
        <BackButton variant="ghost" />
      </div>
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-lavender-bg/50 overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
          <div className={`max-w-6xl mx-auto ${topicData.image ? '' : 'max-w-4xl'}`}>
            <div className={`grid grid-cols-1 ${topicData.image ? 'md:grid-cols-2' : ''} gap-8 items-center`}>
              {/* Content */}
              <div className={`${topicData.image ? 'text-center md:text-left' : 'text-center'}`}>
                <h1 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold text-deep-navy mb-4">
                  {topicData.title}
                </h1>
                <p className={`font-inter text-base md:text-lg text-deep-navy/80 mb-6 ${topicData.image ? '' : 'max-w-2xl mx-auto'}`}>
                  {topicData.description}
                </p>
                {topicData.stats && (
                  <div className="inline-block px-6 py-3 bg-lavender-bg rounded-full border border-lavender-bg/60">
                    <div className="text-3xl font-bold text-primary-purple mb-1">
                      {topicData.stats.percentage}%
                    </div>
                    <div className="text-sm text-deep-navy/70">
                      {topicData.stats.text}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image */}
              {topicData.image && (
                <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-card overflow-hidden shadow-2xl">
                  <Image
                    src={topicData.image}
                    alt={topicData.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Topic Content Section */}
      {topicData.shortContent && (
        <TopicContent content={topicData.shortContent} />
      )}

      {/* Articles Section */}
      <TopicArticles articleSlugs={topicData.articleSlugs || []} topicTags={topicData.tags || []} />

      {/* Guides Section */}
      <Suspense fallback={
        <section className="py-12 bg-lavender-bg/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-h3 font-bold text-deep-navy mb-2">Гайды и материалы</h2>
              <p className="text-body text-deep-navy/70">Загрузка...</p>
            </div>
          </div>
        </section>
      }>
        <TopicGuides topicSlug={topicData.slug} topicTags={topicData.tags || []} />
      </Suspense>

      {/* Checklists Section */}
      <Suspense fallback={
        <section className="py-12 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-h3 font-bold text-deep-navy mb-2">Чек-листы</h2>
              <p className="text-body text-deep-navy/70">Загрузка...</p>
            </div>
          </div>
        </section>
      }>
        <TopicChecklists topicSlug={topicData.slug} topicTags={topicData.tags || []} />
      </Suspense>

      {/* Videos Section */}
      <Suspense fallback={
        <section className="py-12 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-h3 font-bold text-deep-navy mb-2">Видео по теме</h2>
              <p className="text-body text-deep-navy/70">Загрузка...</p>
            </div>
          </div>
        </section>
      }>
        <TopicVideos topicSlug={topicData.slug} topicTags={topicData.tags || []} />
      </Suspense>

      {/* Quizzes Section */}
      <TopicQuizzes quizIds={topicData.quizIds || []} />

      {/* Interactive Cards Section */}
      <InteractiveCards cards={getCardsForTopic(topicData.slug)} />

      {/* Podcasts Section */}
      <TopicPodcasts podcastIds={topicData.podcastIds || []} />

      {/* Disclaimer Section */}
      <section className="py-12 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <MedicalDisclaimer variant="full" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-primary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h3 font-bold text-white mb-4">
              Остались вопросы?
            </h2>
            <p className="text-body-large text-white/90 mb-8">
              Ева — ваш AI-консультант по менопаузе — готова ответить на вопросы по этой теме
            </p>
            <a href="/chat">
              <button className="px-8 py-4 rounded-pill font-semibold transition-all duration-300 bg-white text-primary-purple shadow-button hover:shadow-button-hover hover:-translate-y-0.5">
                Задать вопрос Еве
              </button>
            </a>
          </div>
        </div>
      </section>

      <AskEvaWidget />
    </>
  )
}

// Функция для получения карточек по теме (в будущем из БД или конфига)
function getCardsForTopic(topicSlug: string): Array<{ id: string; type: 'fact' | 'tip' | 'myth_fact' | 'checklist'; title: string; content: string | string[] }> {
  const cardsMap: Record<string, Array<{ id: string; type: 'fact' | 'tip' | 'myth_fact' | 'checklist'; title: string; content: string | string[] }>> = {
    prilivy: [
      {
        id: '1',
        type: 'fact',
        title: 'Статистика приливов',
        content: '75-80% женщин испытывают приливы в период перименопаузы и менопаузы. В среднем приливы длятся 7.4 года, но у некоторых женщин они могут продолжаться до 10-15 лет.',
      },
      {
        id: '2',
        type: 'tip',
        title: '10 способов облегчить приливы',
        content: [
          'Одевайтесь слоями — можно быстро снять один слой',
          'Используйте вентилятор в спальне',
          'Избегайте триггеров: алкоголь, острая пища, горячие напитки',
          'Практикуйте медленное глубокое дыхание',
          'Поддерживайте прохладную температуру в помещении',
          'Выбирайте натуральные ткани (хлопок, лён)',
          'Регулярные физические упражнения',
          'Управляйте стрессом через медитацию или йогу',
          'Держите рядом бутылку холодной воды',
          'Ведите дневник приливов, чтобы найти триггеры',
        ],
      },
      {
        id: '3',
        type: 'myth_fact',
        title: 'Миф о приливах',
        content: 'Миф: Приливы можно просто перетерпеть, они пройдут сами.\n\nФакт: Хотя приливы действительно могут уменьшиться со временем, они могут серьёзно влиять на качество жизни, сон и работоспособность. Существует множество эффективных методов облегчения симптомов — от изменения образа жизни до гормональной терапии.',
      },
    ],
    zgt: [
      {
        id: '1',
        type: 'fact',
        title: 'Когда ЗГТ наиболее эффективна',
        content: 'ЗГТ наиболее эффективна и безопасна, если начата в ранней менопаузе (до 60 лет или в течение 10 лет после менопаузы). В этом возрасте риски минимальны, а преимущества максимальны.',
      },
      {
        id: '2',
        type: 'checklist',
        title: 'Когда стоит рассмотреть ЗГТ',
        content: [
          'Выраженные приливы и ночная потливость',
          'Сухость влагалища и проблемы с мочеиспусканием',
          'Ранняя менопауза (до 45 лет)',
          'Высокий риск остеопороза',
          'Симптомы мешают работать и спать',
        ],
      },
      {
        id: '3',
        type: 'myth_fact',
        title: 'Миф о ЗГТ',
        content: 'Миф: ЗГТ всегда опасна и вызывает рак.\n\nФакт: При правильном назначении и мониторинге ЗГТ безопасна для большинства женщин. Риски минимальны, если начать терапию в ранней менопаузе и регулярно проходить обследования.',
      },
    ],
  }

  return cardsMap[topicSlug] || []
}
