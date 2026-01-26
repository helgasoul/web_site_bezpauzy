import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { FileText, Shield, ArrowRight, AlertCircle, Lock, UserCheck, Mail, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Пользовательское соглашение Telegram-бота | Без |Паузы',
  description: 'Пользовательское соглашение Telegram-бота «Без | паузы» для ассистента Евы',
}

const BotTermsPage: FC = () => {
  const lastUpdated = '24.11.2025'

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Пользовательское соглашение Telegram-бота «Без | паузы»
            </h1>
            <p className="text-body-large text-deep-navy/70">
              Редакция от {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">
            {/* Intro */}
            <section>
              <p className="text-body text-deep-navy/80 leading-relaxed">
                Индивидуальный предприниматель Пучкова Ольга Сергеевна (ИНН 771602232815, ОГРНИП 325774600520114, юридический адрес г. Москва, ул. Изумрудная 13-1-104) (далее — <strong>«Администратор»</strong>), адресует настоящее пользовательское соглашение, являющееся публичной офертой (далее — <strong>«Соглашение»</strong>) о предоставлении права использования Telegram-бота «Без | паузы» (далее — <strong>«Бот»</strong>) любому лицу, достигшему 18 лет, которое запустит Telegram-бот «Без | паузы» на своем устройстве (далее — <strong>«Пользователь»</strong>).
              </p>
            </section>

            {/* Section 1: Terms */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary-purple" />
                1. Термины
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div className="bg-lavender-bg rounded-xl p-4 space-y-2">
                  <p><strong>1.1. Администратор</strong> — индивидуальный предприниматель Пучкова Ольга Сергеевна, ИНН 771602232815, ОГРНИП 325774600520114, являющаяся правообладателем Бота.</p>
                  <p><strong>1.2. Полный доступ</strong> — объем функционала Бота, доступный Пользователю с момента внесения оплаты на условиях Соглашения.</p>
                  <p><strong>1.3. Бот</strong> — совокупность информации, текстов, графических элементов, программ для ЭВМ, а также иных результатов интеллектуальной деятельности, содержащихся в мессенджере Telegram, доступ к которой обеспечивается с пользовательских устройств, подключенных к сети Интернет, посредством мессенджера Telegram по сетевому адресу: <a href="https://t.me/bezpauzy_bot" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">https://t.me/bezpauzy_bot</a>.</p>
                  <p><strong>1.4. Пользователь</strong> — любое лицо, достигшее возраста 18 лет, зарегистрированное в мессенджере Telegram, которое запустит Бот на своем устройстве.</p>
                  <p><strong>1.5. Стороны</strong> — Администратор и Пользователь.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Subject */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                2. Предмет
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>2.1. Соглашение определяет порядок использования Бота Пользователем.</p>
                <p>2.2. Настоящее Соглашение является официальным предложением Администратора о присоединении (заключении) к условиям использования Бота на условиях простой (неисключительной) лицензии. В соответствии со статьей 428 Гражданского кодекса Российской Федерации договор между Сторонами заключается путем присоединения Пользователя к договору в целом.</p>
                <p>2.3. Бот предоставляет Пользователю возможность получения информации по запросу в автоматическом режиме в пределах функционала, описанного в настоящем Соглашении.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-2">Важно:</p>
                      <p className="text-body-small text-yellow-900">
                        2.4. Пользователь, используя Бота, подтверждает, что он ознакомился с условиями Соглашения в полном объеме и принимает все условия Соглашения в полном объеме без каких-либо изъятий и ограничений и обязуется их соблюдать или прекратить использование Бота.
                      </p>
                    </div>
                  </div>
                </div>
                <p>2.5. Использование Бота разрешается только на условиях Соглашения. Если Пользователь не принимает условия Соглашения в полном объёме, то он не имеет права использовать Бот в каких-либо целях.</p>
                <p>2.6. Соглашение считается заключенным с даты принятия (акцепта) Пользователем предложения (оферты) Администратора о заключении договора. Акцептом считается отправка команды /start в Боте.</p>
              </div>
            </section>

            {/* Section 3: Functionality */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                3. Функциональные возможности бота
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>3.1. Бот предназначен для поиска и предоставления Пользователю ответов на запросы, касающиеся здоровья, менопаузы, а также жизни в этот период, на основе информационной базы данных Администратора. Для обработки запросов и формирования ответов Бот может использовать технологии искусственного интеллекта, в частности, ИИ-агент (Chat GPT API).</p>
                <p>3.2. В рамках срока действия Полного доступа Пользователю доступно совершить 3 (три) запроса в день.</p>
                <div className="bg-lavender-bg rounded-xl p-4 mt-4">
                  <p className="font-semibold text-deep-navy mb-2">3.3. Источники информации:</p>
                  <p className="text-body-small text-deep-navy/70">
                    Для предоставления ответов на запросы Пользователей Бот использует информационные источники, сформированные на основе открытых и общедоступных материалов, включая международные клинические рекомендации, научные публикации, книги и иные источники по тематике Бота. Администратор не является автором указанных материалов и не претендует на авторские права на них.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Важно понимать:</p>
                      <p className="text-body-small text-red-900">
                        3.5. Ответы, предоставляемые Ботом, носят исключительно информационно-справочный характер, не являются медицинскими, психологическими или иными профессиональными консультациями, не выражают позицию Администратора и не могут рассматриваться как руководство к действию. Пользователь самостоятельно принимает решение о том, как использовать полученную информацию, и несет полную ответственность за последствия своих действий.
                      </p>
                    </div>
                  </div>
                </div>
                <p>3.10. Пользователь может получить Полный доступ к функционалу Бота после внесения платы за пользование Ботом.</p>
                <p>3.11. Полный доступ после внесения оплаты предоставляется Пользователю на срок 30 (тридцать) дней.</p>
                <p>3.14. Оплата за пользование Ботом производится посредством перехода по ссылке на оплату при нажатии кнопки «Получить полный доступ» в Боте. Оплата осуществляется через платежный сервис ЮKassa, принадлежащий ООО НКО «ЮМани».</p>
                <p>3.20. Оплата за пользование Ботом возврату не подлежит, за исключением случаев, предусмотренных законодательством Российской Федерации.</p>
              </div>
            </section>

            {/* Section 4: Restrictions */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary-purple" />
                4. Ограничения использования бота
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>4.1. Все исключительные права на Бот и входящие в его состав объекты интеллектуальной собственности принадлежат Администратору.</p>
                <p>4.2. Пользователь не вправе использовать Бот и сведения, полученные в результате его использования в целях, противоречащих Соглашению, законодательству Российской Федерации, нарушающих и/или создающих угрозу нарушения прав и законных интересов третьих лиц.</p>
                <p>4.3. Пользователь вправе использовать Бот исключительно для личных целей, не связанных с коммерческим использованием.</p>
              </div>
            </section>

            {/* Section 5: Limitation of Liability */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-primary-purple" />
                5. Ограничение ответственности
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>5.1. Бот предоставляется Пользователю по принципу «как есть» (as is). Администратор не предоставляет никаких гарантий в отношении безошибочной и бесперебойной работы Бота.</p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Важно:</p>
                      <p className="text-body-small text-red-900">
                        5.4. Администратор не является автором предоставляемой в Боте информации. Ответы, направляемые Пользователю через Бот, носят информационный характер и ни при каких условиях не являются профессиональной и/или медицинской консультацией, утверждением о фактах, позицией Администратора, диагнозом, методикой лечения, призывом к действию, врачебной рекомендацией.
                      </p>
                      <p className="text-body-small text-red-900 mt-2">
                        5.5. Администратор не является медицинской организацией и не оказывает медицинские услуги.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Final Provisions */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary-purple" />
                6. Заключительные положения
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>6.1. Персональные данные Пользователей обрабатываются на условиях Политики конфиденциальности, размещенной в сети Интернет по адресу: <Link href="/bot/privacy" className="text-primary-purple hover:underline">/bot/privacy</Link> и в соответствии с условиями Соглашения.</p>
                <p>6.2. Условия настоящего Соглашения могут быть изменены Администратором в одностороннем порядке по собственному усмотрению.</p>
                <p>6.5. Администратор вправе направлять Пользователю уведомления посредством отправки сообщений в чате с Ботом. Стороны признают юридическую силу за документами, направленными таким образом.</p>
                <div className="bg-lavender-bg rounded-xl p-4 mt-4">
                  <p className="font-semibold text-deep-navy mb-2">6.6. Контактная информация:</p>
                  <p className="text-body-small text-deep-navy/70">
                    Пользователь может связаться с Администратором по адресу электронной почты: <a href="mailto:my@bez-pauzy.ru" className="text-primary-purple hover:underline">my@bez-pauzy.ru</a>.
                  </p>
                </div>
                <p>6.7. К отношениям, вытекающим из Соглашения, подлежит применению право Российской Федерации. Все споры, возникающие между Пользователем и Администратором, разрешаются путем переговоров. В случае недостижения согласия, спор может быть решен в суде по месту нахождения Администратора.</p>
              </div>
            </section>

            {/* Navigation */}
            <div className="pt-8 border-t border-lavender-bg flex flex-col sm:flex-row gap-4">
              <Link
                href="/bot/privacy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple/5 transition-colors"
              >
                Политика конфиденциальности бота
              </Link>
              <Link
                href="/bot"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Вернуться к странице бота
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-lavender-bg text-deep-navy rounded-full font-semibold hover:bg-lavender-bg transition-colors"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default BotTermsPage
