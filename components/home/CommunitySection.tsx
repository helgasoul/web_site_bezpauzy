'use client'

import { FC } from 'react'
import { Users, MessageCircle, Shield, HeartHandshake } from 'lucide-react'
import { CommunityAccessButtons } from '@/components/community/CommunityAccessButtons'

interface CommunitySectionProps {}

export const CommunitySection: FC<CommunitySectionProps> = () => {
  return (
    <section
      className="relative py-20 md:py-28 lg:py-32 overflow-hidden"
      aria-labelledby="community-heading"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10" />
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-24 -right-32 h-72 w-72 rounded-full bg-primary-purple/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-32 h-72 w-72 rounded-full bg-ocean-wave-start/25 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 md:px-8 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-deep-navy/70 shadow-sm backdrop-blur">
            <Users className="h-4 w-4 text-primary-purple" />
            Бесплатное сообщество
          </p>
          <h2
            id="community-heading"
            className="mt-6 font-montserrat text-3xl md:text-5xl lg:text-6xl font-bold text-deep-navy"
          >
            Сообщество «Без&nbsp;паузы»
          </h2>
          <p className="mt-4 md:mt-6 font-inter text-lg md:text-xl lg:text-2xl text-deep-navy/80 leading-relaxed">
            Поддержка и знания для женщин в период менопаузы.
          </p>
        </div>

        {/* Content card */}
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-[1.3fr_minmax(0,1fr)]">
          {/* Left: description + features */}
          <div className="rounded-3xl bg-white/90 p-6 md:p-8 lg:p-10 shadow-strong backdrop-blur border border-white/70">
            <p className="font-inter text-base md:text-lg text-deep-navy/80 leading-relaxed">
              Это безопасное пространство, где вы можете задать вопросы, получить
              научно обоснованные ответы простым языком и почувствовать, что вы не
              одни в своих переживаниях. Мы объединяем женщин 40+ и экспертов —
              гинекологов, маммологов, нутрициологов — чтобы вместе разбираться в
              симптомах, вариантах лечения и способах сохранить энергию без паузы.
            </p>
            <p className="mt-4 font-inter text-base md:text-lg text-primary-purple font-semibold leading-relaxed">
              Сообщество полностью бесплатное, потому что мы верим, что каждая женщина заслуживает доступа к качественной поддержке и информации.
            </p>

            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex gap-3 rounded-2xl bg-primary-purple/5 p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-purple/10">
                  <HeartHandshake className="h-5 w-5 text-primary-purple" />
                </div>
                <div>
                  <dt className="font-montserrat text-sm md:text-base font-semibold text-deep-navy">
                    Тёплое и модерируемое пространство
                  </dt>
                  <dd className="mt-1 text-sm md:text-sm text-deep-navy/80">
                    Без осуждения и стыда — только уважение, эмпатия и поддержка
                    женщин с похожим опытом.
                  </dd>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-warm-accent/5 p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-warm-accent/10">
                  <MessageCircle className="h-5 w-5 text-warm-accent" />
                </div>
                <div>
                  <dt className="font-montserrat text-sm md:text-base font-semibold text-deep-navy">
                    Ответы экспертов простым языком
                  </dt>
                  <dd className="mt-1 text-sm md:text-sm text-deep-navy/80">
                    Гинекологи, маммологи и нутрициологи помогают понять, что
                    происходит с организмом, без сложного жаргона.
                  </dd>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-ocean-wave-start/5 p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-ocean-wave-start/10">
                  <Shield className="h-5 w-5 text-ocean-wave-start" />
                </div>
                <div>
                  <dt className="font-montserrat text-sm md:text-base font-semibold text-deep-navy">
                    Проверенная информация
                  </dt>
                  <dd className="mt-1 text-sm md:text-sm text-deep-navy/80">
                    Материалы основаны на современных клинических рекомендациях и
                    научных обзорах.
                  </dd>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-primary-purple/5 p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-purple/10">
                  <Users className="h-5 w-5 text-primary-purple" />
                </div>
                <div>
                  <dt className="font-montserrat text-sm md:text-base font-semibold text-deep-navy">
                    Совместные вебинары и встречи
                  </dt>
                  <dd className="mt-1 text-sm md:text-sm text-deep-navy/80">
                    Живые эфиры, разборы вопросов и практические рекомендации по
                    сну, питанию и управлению симптомами.
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-deep-navy/5 pt-6 text-sm text-deep-navy/70 md:flex-row">
              <p className="font-inter">
                Присоединяйтесь и сделайте следующий шаг к жизни без паузы.
              </p>
            </div>
          </div>

          {/* Right: CTA card */}
          <aside className="flex items-stretch">
            <div className="relative flex w-full flex-1 flex-col justify-between rounded-3xl bg-gradient-to-br from-primary-purple to-ocean-wave-start p-6 md:p-7 lg:p-8 text-white shadow-strong">
              <div>
                <h3 className="font-montserrat text-2xl md:text-3xl font-semibold leading-snug">
                  Присоединиться к сообществу
                </h3>
                <p className="mt-3 font-inter text-sm md:text-base text-white/85 leading-relaxed">
                  Получите доступ к поддержке, экспертным разбором и
                  сообществу женщин, которые понимают вас с полуслова.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-sm font-semibold text-white">100% бесплатно</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ul className="space-y-2 text-sm md:text-sm font-inter text-white/85">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm-accent" />
                    Участие доступно онлайн из любой точки мира
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm-accent" />
                    Уважительное общение и бережная модерация
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm-accent" />
                    Никаких скрытых платежей или подписок
                  </li>
                </ul>

                <div className="w-full max-w-full overflow-hidden">
                  <CommunityAccessButtons variant="default" className="w-full flex-col" />
                </div>

                <p className="text-center text-xs text-white/70">
                  Научно обоснованный подход, уважение к вашим решениям и никакого
                  навязчивого контента.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}


