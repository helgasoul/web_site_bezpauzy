import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { Shield, FileText, Lock, Eye, Database, UserCheck, Mail, AlertCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности Telegram-бота | Без |Паузы',
  description: 'Политика конфиденциальности Telegram-бота «Без | паузы» для ассистента Евы в соответствии с ФЗ-152',
}

const BotPrivacyPage: FC = () => {
  const lastUpdated = '02.12.2025'

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Политика конфиденциальности Telegram-бота «Без | паузы»
            </h1>
            <p className="text-body-large text-deep-navy/70">
              Утверждена приказом № 01/25 от {lastUpdated}
            </p>
            <p className="text-body text-deep-navy/60 mt-2">
              Индивидуальный предприниматель Пучкова Ольга Сергеевна, ИНН 771602232815, ОГРНИП 325774600520114
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">
            {/* Section 1: General Provisions */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary-purple" />
                Общие положения
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  1. Настоящая Политика конфиденциальности (далее — Политика) описывает, как <strong>индивидуальный предприниматель Пучкова Ольга Сергеевна, ИНН 771602232815, ОГРНИП 325774600520114</strong> (далее также «оператор», «мы», «нас», «наши») обрабатывает персональные данные пользователей <a href="https://t.me/bezpauzy_bot" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">Telegram-бота «Без | паузы»</a>.
                </p>
                <div className="bg-lavender-bg rounded-xl p-4 mt-4">
                  <p className="font-semibold text-deep-navy mb-3">2. В Политике вам могут встретиться следующие термины:</p>
                  <ul className="list-disc list-inside space-y-2 text-body-small text-deep-navy/70 ml-4">
                    <li><strong>Бот</strong> — Telegram-бот «Без | паузы», доступный по адресу: <a href="https://t.me/bezpauzy_bot" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">https://t.me/bezpauzy_bot</a>.</li>
                    <li><strong>Закон 152-ФЗ</strong> — Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных».</li>
                    <li><strong>Оператор</strong> — юридическое или физическое лицо, осуществляющее обработку персональных данных. При использовании Бота мы являемся оператором ваших персональных данных.</li>
                    <li><strong>Пользователь</strong> — любое физическое лицо, достигшее 18 лет, использующее Бот.</li>
                    <li><strong>Пользовательское соглашение</strong> — публичная оферта, в которой указаны условия и порядок использования Бота. Ознакомиться можно по ссылке: <Link href="/bot/terms" className="text-primary-purple hover:underline">/bot/terms</Link>.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Your Rights */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary-purple" />
                Ваши права в соответствии с Законом 152-ФЗ
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p className="font-semibold text-deep-navy mb-2">Вы можете:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>получить доступ к своим персональным данным;</li>
                  <li>потребовать от нас их уточнения, блокирования или уничтожения;</li>
                  <li>принимать меры по защите своих прав, в том числе обращаться в территориальный орган Роскомнадзора для обжалования наших действий.</li>
                </ul>
                <div className="bg-lavender-bg rounded-xl p-4 mt-4">
                  <p className="font-semibold text-deep-navy mb-2">Коммуникация с нами:</p>
                  <p className="text-body-small text-deep-navy/70 mb-2">
                    Для реализации ваших прав вы можете направить нам запрос:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                    <li>по адресу электронной почты: <a href="mailto:my@bez-pauzy.ru" className="text-primary-purple hover:underline">my@bez-pauzy.ru</a></li>
                    <li>по почтовому адресу: 129281, г. Москва, ул. Изумрудная 13-1-104</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Third Parties */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary-purple" />
                Привлечение третьих лиц к обработке персональных данных
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>1. В целях обеспечения записи, хранения и иных действий по обработке ваших персональных данных мы поручаем ООО «Бегет» (Россия) обработку персональных данных, указанных в разделе 5 Политики.</p>
                <p>4. Мы осуществляем сбор, запись и последующую обработку персональных данных граждан Российской Федерации с использованием баз данных, находящихся на территории Российской Федерации. Базы данных, находящиеся за пределами территории Российской Федерации, не используются.</p>
                <p>5. Мы не осуществляем трансграничную передачу персональных данных.</p>
                <div className="bg-lavender-bg rounded-xl p-4 mt-4">
                  <p className="font-semibold text-deep-navy mb-2">6. Использование технологий ИИ:</p>
                  <p className="text-body-small text-deep-navy/70">
                    Для предоставления функционала Бота мы можем использовать технологии искусственного интеллекта, в частности ИИ-агента (Chat GPT API). Для этого мы можем передавать ИИ-агенту ваши запросы в обезличенном виде без возможности отнесения их к вам прямо или косвенно. Мы не передаем ваши персональные данные ИИ-агенту.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Processing Purpose */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary-purple" />
                Цели, сроки и основания обработки ваших персональных данных
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">Цель обработки:</p>
                  <p className="text-body-small text-deep-navy/70 mb-4">
                    Предоставить вам возможность пользоваться Ботом в соответствии с условиями Пользовательского соглашения.
                  </p>
                  <p className="font-semibold text-deep-navy mb-2">Какие данные мы собираем для данной цели?</p>
                  <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                    <li>Telegram ID</li>
                    <li>Возрастная группа</li>
                    <li>Город проживания</li>
                    <li>Данные об оформленной вами подписке</li>
                    <li>Данные о количестве, дате и времени отправленных вами запросов в Боте</li>
                    <li>Сведения, содержащиеся в отправляемом вами запросе в Боте</li>
                    <li>Данные о взаимодействии с Ботом</li>
                    <li>Информация о используемом устройстве и браузере</li>
                    <li>Время и дата обращения к Боту</li>
                  </ul>
                  <p className="font-semibold text-deep-navy mb-2 mt-4">Основание обработки:</p>
                  <p className="text-body-small text-deep-navy/70">
                    Мы обрабатываем перечисленные персональные данные на основании принятого вами Пользовательского соглашения. Без этого мы не сможем предоставить вам возможность пользоваться Ботом.
                  </p>
                  <p className="font-semibold text-deep-navy mb-2 mt-4">Как долго мы обрабатываем персональные данные?</p>
                  <p className="text-body-small text-deep-navy/70">
                    Мы обрабатываем данные в течение всего срока действия Пользовательского соглашения, если законодательство РФ не требует более длительного срока обработки.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-body-small text-yellow-900">
                      <strong>Важно:</strong> Мы не обрабатываем персональные данные специальной категории, а также биометрические персональные данные.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Processing Conditions */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary-purple" />
                Условия обработки ваших данных
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Мы заботимся о конфиденциальности ваших персональных данных и поэтому принимаем все необходимые в соответствии с Законом 152-ФЗ меры для их защиты.</p>
                <p>Мы осуществляем обработку ваших персональных данных в соответствии со следующими принципами:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Обработка персональных данных осуществляется на законной и справедливой основе</li>
                  <li>Обработка персональных данных ограничивается достижением конкретных, заранее определенных и законных целей</li>
                  <li>Обработка персональных данных, несовместимая с целями сбора персональных данных, не осуществляется</li>
                  <li>При обработке персональных данных обеспечивается их точность, достаточность и актуальность по отношению к целям обработки</li>
                  <li>Персональные данные уничтожаются по достижении целей обработки или в случае утраты необходимости в их достижении</li>
                </ul>
                <p>Мы обрабатываем персональные данные автоматизированным способом.</p>
              </div>
            </section>

            {/* Section 6: Final Provisions */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                Заключительные положения
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Политика доступна для ознакомления в любое время по адресу: <Link href="/bot/privacy" className="text-primary-purple hover:underline">/bot/privacy</Link></p>
                <p>Мы можем менять Политику по мере необходимости, например, в случае изменения требований закона или наших бизнес-процессов. Обновленная Политика вступает в силу со дня ее размещения, поэтому просим следить за ее изменениями.</p>
                <p>Все вопросы, не урегулированные Политикой, регламентируются законодательством Российской Федерации.</p>
                <div className="bg-lavender-bg rounded-xl p-4 mt-4">
                  <p className="font-semibold text-deep-navy mb-2">Вопросы по политике конфиденциальности?</p>
                  <p className="text-body-small text-deep-navy/70">
                    Для оперативной связи вы можете обратиться к нам, написав на нашу электронную почту: <a href="mailto:my@bez-pauzy.ru" className="text-primary-purple hover:underline">my@bez-pauzy.ru</a> или в мессенджере Telegram @MikadoNuove.
                  </p>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <div className="pt-8 border-t border-lavender-bg flex flex-col sm:flex-row gap-4">
              <Link
                href="/bot/terms"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple/5 transition-colors"
              >
                Пользовательское соглашение бота
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

export default BotPrivacyPage
