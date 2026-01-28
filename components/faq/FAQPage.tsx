'use client'

import { FC, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, HelpCircle, MessageCircle, BookOpen, CreditCard, Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { FAQAccordion } from '@/components/community/FAQAccordion'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/ui/BackButton'

export type FAQCategory = 'all' | 'project' | 'menopause' | 'articles' | 'bot' | 'technical'

interface FAQItem {
  question: string
  answer: string
  category: FAQCategory
}

const faqData: FAQItem[] = [
  // О проекте и боте
  {
    question: 'Что такое проект "Без |Паузы"?',
    answer:
      'Без |Паузы — это научно обоснованная платформа поддержки для женщин 40+ в период менопаузы. Мы предоставляем доступ к AI-консультанту Еве, статьям от врачей-экспертов, видео и другим ресурсам для поддержания здоровья и качества жизни.',
    category: 'project',
  },
  {
    question: 'Кто создал проект "Без |Паузы"?',
    answer:
      'Проект создан командой специалистов при участии гинекологов, маммологов и нутрициологов. Все материалы проверяются экспертами и основаны на научных данных.',
    category: 'project',
  },
  {
    question: 'Что такое ассистент Ева?',
    answer:
      'Ева — это AI-консультант, работающий на валидированной врачом научной базе данных, основанной на академических публикациях, международных рекомендациях и клинических исследованиях. Она доступна 24/7 в Telegram-боте и дает научно обоснованные ответы на вопросы о менопаузе, но не заменяет консультацию врача.',
    category: 'bot',
  },
  {
    question: 'Ева заменяет врача?',
    answer:
      'Нет. Ева предоставляет информационную поддержку на основе научных данных, но не ставит диагнозы и не назначает лечение. Для медицинских решений всегда консультируйтесь с врачом.',
    category: 'bot',
  },
  {
    question: 'Как работает бот Ева?',
    answer:
      'Вы задаете вопрос в Telegram-боте @bezpauzy_bot, Ева анализирует его на основе валидированной врачом научной базы данных (академические публикации, международные рекомендации, клинические исследования) и дает персонализированный научно обоснованный ответ. Ева работает только по платной подписке. Бесплатные материалы доступны на сайте в разделах "Журнал", "Чек-листы" и "Гайды".',
    category: 'bot',
  },

  // О менопаузе (общие вопросы)
  {
    question: 'Что такое менопауза?',
    answer:
      'Менопауза — это естественный этап жизни женщины, когда прекращаются менструации и снижается уровень эстрогена. Обычно наступает в возрасте 45-55 лет. Период до менопаузы называется перименопаузой, после — постменопаузой.',
    category: 'menopause',
  },
  {
    question: 'Какие симптомы менопаузы самые распространенные?',
    answer:
      'Наиболее частые симптомы: приливы жара, ночная потливость, нарушения сна, изменения настроения, увеличение веса, сухость влагалища, снижение либидо. Интенсивность и набор симптомов индивидуальны.',
    category: 'menopause',
  },
  {
    question: 'Когда нужно обращаться к врачу при менопаузе?',
    answer:
      'Рекомендуется обратиться к гинекологу при появлении первых признаков перименопаузы (нерегулярные циклы, изменения самочувствия). Обязательно посетите врача при обильных кровотечениях, сильных приливах, мешающих повседневной жизни, или при подозрении на другие проблемы со здоровьем.',
    category: 'menopause',
  },
  {
    question: 'Можно ли предотвратить менопаузу?',
    answer:
      'Менопауза — естественный процесс, предотвратить его нельзя. Но можно улучшить качество жизни в этот период: здоровое питание, регулярная физическая активность, управление стрессом, при необходимости — заместительная гормональная терапия (ЗГТ) под наблюдением врача.',
    category: 'menopause',
  },
  {
    question: 'Как долго длятся симптомы менопаузы?',
    answer:
      'Средняя длительность симптомов — 4-7 лет, но у некоторых женщин может быть до 10-12 лет. Приливы обычно ослабевают со временем, но могут периодически возвращаться.',
    category: 'menopause',
  },

  // О статьях и ресурсах
  {
    question: 'Кто пишет статьи на сайте?',
    answer:
      'Статьи пишут практикующие врачи-эксперты: гинекологи, маммологи и нутрициологи. Каждая статья проходит проверку и основана на научных данных и клинических рекомендациях.',
    category: 'articles',
  },
  {
    question: 'Как часто публикуются новые статьи?',
    answer:
      'Новые статьи публикуются регулярно. Подпишитесь на рассылку, чтобы получать уведомления о новых материалах.',
    category: 'articles',
  },
  {
    question: 'Можно ли скачать статьи или гайды?',
    answer:
      'Да, многие ресурсы доступны для скачивания: чек-листы, гайды по питанию и другие материалы. Найдите их в разделе "Ресурсы" → "Чек-листы" или "Гайды".',
    category: 'articles',
  },
  {
    question: 'Все ли статьи бесплатны?',
    answer:
      'Большинство статей в блоге доступны бесплатно. Премиум-контент (например, расширенные видео-курсы) доступен по подписке в боте.',
    category: 'articles',
  },

  // О боте и подписках
  {
    question: 'Сколько стоит подписка на бота Ева?',
    answer:
      'Доступны две подписки: месячная (990₽/месяц) и годовая (7990₽/год, экономия 4000₽). Обе включают неограниченные вопросы Еве, персонализированные ответы, базу знаний, видео уроки от врачей и синхронизацию с Telegram. Годовая подписка дает приоритетную поддержку и скидки на консультации экспертов.',
    category: 'bot',
  },
  {
    question: 'Как оплатить подписку?',
    answer:
      'Оплата происходит через бота Ева в Telegram. Доступны различные способы оплаты через безопасные платежные системы.',
    category: 'bot',
  },
  {
    question: 'Можно ли отменить подписку?',
    answer:
      'Да, вы можете отменить подписку в любой момент через бота. Доступ к платному контенту сохранится до конца оплаченного периода.',
    category: 'bot',
  },
  {
    question: 'Есть ли бесплатная версия бота Ева?',
    answer:
      'Нет, Ева работает только по платной подписке. Однако на сайте доступно множество бесплатных материалов: статьи в разделе "Журнал", чек-листы, а также бесплатные и платные гайды. Все это можно использовать без регистрации и оплаты.',
    category: 'bot',
  },

  // Технические вопросы
  {
    question: 'Как начать пользоваться ботом?',
    answer:
      'Просто откройте Telegram и найдите бота @bezpauzy_bot, нажмите "Начать" и следуйте инструкциям. Регистрация занимает минуту.',
    category: 'technical',
  },
  {
    question: 'Мои данные в безопасности?',
    answer:
      'Да. Мы соблюдаем ФЗ-152 о защите персональных данных, все данные зашифрованы. Подробнее в разделе "Политика конфиденциальности".',
    category: 'technical',
  },
  {
    question: 'Нужно ли устанавливать приложение?',
    answer:
      'Нет, бот работает прямо в Telegram. Для сайта также не требуется установка приложения — все доступно через браузер.',
    category: 'technical',
  },
  {
    question: 'Бот работает только в России?',
    answer:
      'Бот доступен для пользователей из любой страны, где работает Telegram. Но основная информация ориентирована на российскую медицинскую практику и рекомендации.',
    category: 'technical',
  },
]

const categories = [
  { id: 'all' as FAQCategory, name: 'Все вопросы', icon: HelpCircle },
  { id: 'project' as FAQCategory, name: 'О проекте', icon: Sparkles },
  { id: 'menopause' as FAQCategory, name: 'О менопаузе', icon: MessageCircle },
  { id: 'articles' as FAQCategory, name: 'Статьи и ресурсы', icon: BookOpen },
  { id: 'bot' as FAQCategory, name: 'Бот и подписки', icon: CreditCard },
  { id: 'technical' as FAQCategory, name: 'Технические', icon: Settings },
]

export const FAQPage: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = useMemo(() => {
    let filtered = faqData

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Поиск по тексту
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [selectedCategory, searchQuery])

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <HelpCircle className="w-5 h-5 text-white" />
              <span className="text-body-small font-semibold text-white">Помощь и поддержка</span>
            </div>
            <h1 className="text-h1 md:text-display font-bold text-white mb-6 drop-shadow-lg">
              Часто задаваемые вопросы
            </h1>
            <p className="text-body-large text-white/95 mb-8 drop-shadow-md">
              Ответы на популярные вопросы о менопаузе, проекте Без |Паузы и ассистенте Еве
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-deep-navy/40 z-10" />
              <input
                type="text"
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white/30 focus:border-primary-purple focus:outline-none bg-white/95 backdrop-blur-sm shadow-card text-deep-navy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories and FAQ */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                const count =
                  category.id === 'all'
                    ? faqData.length
                    : faqData.filter((item) => item.category === category.id).length

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-body font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-purple text-white shadow-button'
                        : 'bg-white text-deep-navy hover:bg-lavender-bg border border-lavender-bg'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span
                      className={`ml-1 text-body-small ${
                        isActive ? 'opacity-80' : 'opacity-60'
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* FAQ List */}
          {filteredFAQs.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <FAQAccordion items={filteredFAQs.map((item) => ({ question: item.question, answer: item.answer }))} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16">
              <HelpCircle className="w-16 h-16 text-deep-navy/20 mx-auto mb-4" />
              <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                Ничего не найдено
              </h3>
              <p className="text-body text-deep-navy/70 mb-6">
                Попробуйте изменить поисковый запрос или выбрать другую категорию.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-lavender-bg to-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
            <div className="relative z-10">
              <MessageCircle className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-h2 md:text-h1 font-bold mb-4">
                Не нашли ответ на свой вопрос?
              </h2>
              <p className="text-body-large mb-8 text-white/90">
                Спросите Еву в боте — она ответит на любой вопрос о менопаузе 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/chat">
                  <Button variant="ghost" className="bg-white text-primary-purple hover:bg-white/90">
                    Начать диалог с Евой →
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button variant="ghost" className="border-2 border-white/30 text-white hover:bg-white/10">
                    Бесплатные материалы на сайте →
                  </Button>
                </Link>
              </div>
              <p className="text-body-small text-white/70 mt-6">
                На сайте доступны бесплатные статьи, чек-листы, а также бесплатные и платные гайды без регистрации
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

