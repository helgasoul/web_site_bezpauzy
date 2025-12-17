import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import { FAQAccordion } from '@/components/community/FAQAccordion'
import { JoinCommunityButton } from '@/components/community/JoinCommunityButton'
import { Users, MessageCircle, Shield, HeartHandshake, BookOpen, Video, UsersRound, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Сообщество «Без паузы» — Бесплатная поддержка | Без |Паузы',
  description: 'Присоединяйтесь к бесплатному сообществу женщин 40+ в период менопаузы. Поддержка, экспертные ответы, вебинары и безопасное пространство для общения.',
  keywords: ['сообщество', 'менопауза', 'поддержка', 'бесплатно', 'женское здоровье', 'эксперты'],
  openGraph: {
    title: 'Сообщество «Без паузы» — Бесплатная поддержка',
    description: 'Присоединяйтесь к бесплатному сообществу женщин в период менопаузы',
    type: 'website',
  },
}

export default function CommunityPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent/30 text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <Users className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Бесплатное сообщество</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6 drop-shadow-lg">
                Сообщество «Без паузы»
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto drop-shadow-md leading-relaxed mb-8">
                Поддержка и знания для женщин в период менопаузы
              </p>
              <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
                Безопасное пространство, где вы можете задать вопросы, получить научно обоснованные ответы простым языком и почувствовать, что вы не одни в своих переживаниях.
              </p>
            </div>
          </div>
        </section>

        {/* Why Community Section */}
        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
                Почему это важно
              </h2>
              <div className="space-y-6 text-body text-deep-navy/80 leading-relaxed">
                <p>
                  Менопауза — это не просто медицинский процесс. Это важный жизненный этап, который затрагивает все аспекты жизни: физическое здоровье, эмоциональное состояние, отношения, карьеру и самоощущение. К сожалению, многие женщины проходят через этот период в одиночестве, не понимая, что происходит с их телом, и не зная, куда обратиться за поддержкой.
                </p>
                <p>
                  Мы объединяем женщин 40+ и экспертов — гинекологов, маммологов, нутрициологов — чтобы вместе разбираться в симптомах, вариантах лечения и способах сохранить энергию без паузы. В нашем сообществе нет места стыду, осуждению или навязыванию решений. Только уважение, эмпатия и научно обоснованная информация.
                </p>
                <p className="font-semibold text-primary-purple">
                  Сообщество полностью бесплатное, потому что мы верим, что каждая женщина заслуживает доступа к качественной поддержке и информации.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="py-16 md:py-24 bg-lavender-bg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
                Что входит в сообщество
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Feature 1 */}
                <div className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-purple/10 rounded-full flex items-center justify-center">
                      <HeartHandshake className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                        Тёплое и модерируемое пространство
                      </h3>
                      <p className="text-body text-deep-navy/70">
                        Без осуждения и стыда — только уважение, эмпатия и поддержка женщин с похожим опытом. Наше сообщество модерируется, чтобы обеспечить безопасную и комфортную атмосферу для всех участниц.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-warm-accent/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-warm-accent" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                        Ответы экспертов простым языком
                      </h3>
                      <p className="text-body text-deep-navy/70">
                        Гинекологи, маммологи и нутрициологи помогают понять, что происходит с организмом, без сложного медицинского жаргона. Вы получаете научно обоснованные ответы, которые легко применить в жизни.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-ocean-wave-start/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-ocean-wave-start" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                        Проверенная информация
                      </h3>
                      <p className="text-body text-deep-navy/70">
                        Все материалы основаны на современных клинических рекомендациях и научных обзорах. Мы не продвигаем непроверенные методы лечения и всегда указываем источники информации.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-purple/10 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                        Вебинары и встречи
                      </h3>
                      <p className="text-body text-deep-navy/70">
                        Регулярные живые эфиры с экспертами, разборы вопросов участниц и практические рекомендации по сну, питанию и управлению симптомами менопаузы.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-warm-accent/10 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-warm-accent" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                        Библиотека ресурсов
                      </h3>
                      <p className="text-body text-deep-navy/70">
                        Доступ к статьям, гайдам, чек-листам и другим материалам, которые помогут вам лучше понять свой организм и принимать обоснованные решения о здоровье.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 6 */}
                <div className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-ocean-wave-start/10 rounded-full flex items-center justify-center">
                      <UsersRound className="w-6 h-6 text-ocean-wave-start" />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                        Поддержка 24/7
                      </h3>
                      <p className="text-body text-deep-navy/70">
                        Вы можете задать вопрос или поделиться опытом в любое время. Наше сообщество активно, и вы всегда найдёте поддержку и понимание от других участниц.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
                Часто задаваемые вопросы
              </h2>
              <FAQAccordion
                items={[
                  {
                    question: 'Сообщество действительно бесплатное?',
                    answer: 'Да, участие в сообществе полностью бесплатное. Мы верим, что каждая женщина заслуживает доступа к качественной поддержке и информации о менопаузе, независимо от финансовых возможностей.',
                  },
                  {
                    question: 'Как присоединиться к сообществу?',
                    answer: 'Присоединение простое и быстрое. Нажмите кнопку «Присоединиться к сообществу» ниже, заполните короткую форму регистрации, и вы сразу получите доступ ко всем возможностям сообщества.',
                  },
                  {
                    question: 'Кто может присоединиться?',
                    answer: 'Сообщество создано для женщин 40+, которые проходят через перименопаузу или менопаузу, а также для тех, кто хочет подготовиться к этому этапу жизни. Мы также рады женщинам, которые поддерживают своих близких в этом процессе.',
                  },
                  {
                    question: 'Кто отвечает на вопросы в сообществе?',
                    answer: 'На вопросы отвечают эксперты — гинекологи, маммологи и нутрициологи, которые специализируются на женском здоровье в период менопаузы. Также участницы сообщества делятся своим опытом и поддерживают друг друга.',
                  },
                  {
                    question: 'Как часто проходят вебинары?',
                    answer: 'Мы проводим вебинары регулярно, обычно 1-2 раза в месяц. Все участницы сообщества получают уведомления о предстоящих эфирах и могут задавать вопросы заранее. Записи вебинаров доступны в библиотеке ресурсов.',
                  },
                  {
                    question: 'Мои данные будут в безопасности?',
                    answer: 'Да, мы серьёзно относимся к защите ваших данных. Вся информация хранится в зашифрованном виде, и мы не передаём ваши данные третьим лицам. Вы можете участвовать в сообществе анонимно, если хотите.',
                  },
                  {
                    question: 'Можно ли задавать вопросы о конкретных симптомах?',
                    answer: 'Да, вы можете задавать вопросы о любых симптомах и переживаниях, связанных с менопаузой. Однако важно помнить, что сообщество не заменяет консультацию с врачом. Для постановки диагноза и назначения лечения необходимо обратиться к специалисту лично.',
                  },
                  {
                    question: 'Что делать, если я хочу покинуть сообщество?',
                    answer: 'Вы можете покинуть сообщество в любой момент. Просто напишите нам, и мы удалим ваш аккаунт и все связанные данные. Ваше участие в сообществе — это ваш выбор, и мы уважаем любое решение.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-30" />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-30" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-h2 font-bold text-white">
                Присоединяйтесь к сообществу «Без паузы»
              </h2>
              <p className="text-body-large text-white/90 max-w-2xl mx-auto leading-relaxed">
                Получите доступ к поддержке, экспертным разборам и сообществу женщин, которые понимают вас с полуслова. Участие полностью бесплатное.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <JoinCommunityButton />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-warm-accent flex-shrink-0" />
                  <span className="text-sm md:text-base">Бесплатное участие</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-warm-accent flex-shrink-0" />
                  <span className="text-sm md:text-base">Экспертные ответы</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-warm-accent flex-shrink-0" />
                  <span className="text-sm md:text-base">Поддержка 24/7</span>
                </div>
              </div>

              <p className="text-sm text-white/70 pt-4">
                Научно обоснованный подход, уважение к вашим решениям и никакого навязчивого контента.
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
