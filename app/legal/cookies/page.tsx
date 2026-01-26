import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { Cookie, Shield, BarChart3, Megaphone, Sliders, AlertCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Политика использования cookie | Без |Паузы',
  description: 'Подробная информация о том, какие cookie мы используем, зачем и как вы можете управлять ими',
}

const CookiePolicyPage: FC = () => {
  const lastUpdated = new Date('2026-01-09').toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl mb-6">
              <Cookie className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Политика использования файлов cookie
            </h1>
            <p className="text-body-large text-deep-navy/70">
              Сайт: bezpauzy.com
            </p>
            <p className="text-body text-deep-navy/60 mt-2">
              Дата последнего обновления: {lastUpdated}
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-lavender-bg rounded-2xl p-6 mb-8">
            <p className="text-body text-deep-navy/80">
              Наш сайт использует файлы cookie для улучшения вашего опыта, аналитики и показа релевантного контента. 
              Вы можете управлять настройками cookie в любое время на{' '}
              <Link href="/cookies" className="text-primary-purple hover:text-ocean-wave-start underline font-medium">
                странице управления cookie
              </Link>
              .
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Cookie className="w-6 h-6 text-primary-purple" />
                1. Что такое файлы cookie?
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  <strong>Cookie (куки)</strong> — это небольшие текстовые файлы, которые сохраняются в вашем браузере 
                  или на устройстве при посещении нашего сайта. Они помогают сайту запоминать информацию о вашем визите: 
                  настройки, предпочтения, действия на сайте.
                </p>
                <div className="bg-lavender-bg rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-deep-navy">Типы cookie по длительности хранения:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Сеансовые</strong> — существуют только во время работы браузера и удаляются после его закрытия</li>
                    <li><strong>Постоянные</strong> — остаются на устройстве до истечения срока действия или до ручного удаления</li>
                  </ul>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-deep-navy">Типы cookie по источнику:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Собственные (первой стороны)</strong> — устанавливаются непосредственно сайтом bezpauzy.com</li>
                    <li><strong>Сторонние (третьей стороны)</strong> — устанавливаются внешними сервисами (аналитика, реклама)</li>
                  </ul>
                </div>
                <p className="text-sm text-deep-navy/70 italic">
                  Правовая основа: Согласно Федеральному закону №152-ФЗ «О персональных данных» и изменениям от закона №420-ФЗ 
                  (вступили в силу 30 мая 2025 года), файлы cookie являются персональными данными, так как позволяют идентифицировать пользователей.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                2. Похожие технологии
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Кроме cookie, мы используем следующие технологии отслеживания:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Веб-маяки (пиксели)</strong> — невидимые элементы на страницах и в email-рассылках, которые помогают нам понять, как вы взаимодействуете с контентом</li>
                  <li><strong>Локальное хранилище (Local Storage)</strong> — технология браузера для сохранения данных о ваших предпочтениях на сайте</li>
                  <li><strong>Журналы событий</strong> — записи о ваших действиях на сайте (например, использование калькуляторов здоровья, прослушивание подкастов)</li>
                  <li><strong>Идентификаторы устройств</strong> — при использовании мобильного приложения или мобильной версии сайта могут использоваться идентификаторы для аналитики и персонализации контента</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                3. Зачем мы используем cookie?
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Файлы cookie необходимы для:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-2">✓ Обеспечения работы сайта</p>
                    <p className="text-sm text-deep-navy/70">Вход в личный кабинет, сохранение настроек</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-2">✓ Улучшения вашего опыта</p>
                    <p className="text-sm text-deep-navy/70">Запоминание языка, предпочтений в отображении контента</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-2">✓ Аналитики</p>
                    <p className="text-sm text-deep-navy/70">Понимание, какие материалы наиболее полезны</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-2">✓ Персонализации контента</p>
                    <p className="text-sm text-deep-navy/70">Показ релевантных статей и рекомендаций</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary-purple" />
                4. Категории файлов cookie на нашем сайте
              </h2>
              <div className="space-y-6">
                {/* Необходимые */}
                <div className="bg-lavender-bg rounded-xl p-6 border-2 border-primary-purple/20">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                        4.1. Строго необходимые (обязательные)
                      </h3>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Эти cookie необходимы для базовой работы сайта и <strong>не требуют вашего согласия</strong>.
                      </p>
                      <p className="text-body-small font-semibold text-deep-navy mb-2">Примеры использования:</p>
                      <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                        <li>Аутентификация и поддержание сеанса</li>
                        <li>Запоминание вашего согласия на использование cookie</li>
                        <li>Безопасность сайта и защита от мошенничества</li>
                        <li>Корректное отображение сайта</li>
                      </ul>
                      <p className="text-xs text-deep-navy/60 mt-3">
                        <strong>Срок хранения:</strong> от сеанса до 12 месяцев
                      </p>
                    </div>
                  </div>
                </div>

                {/* Функциональные */}
                <div className="bg-white rounded-xl p-6 border-2 border-lavender-bg">
                  <div className="flex items-start gap-3 mb-3">
                    <Sliders className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                        4.2. Функциональные
                      </h3>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Эти cookie улучшают функциональность сайта и персонализируют ваш опыт.
                      </p>
                      <p className="text-body-small font-semibold text-deep-navy mb-2">Примеры использования:</p>
                      <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                        <li>Запоминание ваших предпочтений (размер шрифта, язык интерфейса)</li>
                        <li>Сохранение результатов калькуляторов здоровья</li>
                        <li>Запоминание прогресса при прохождении образовательных материалов</li>
                      </ul>
                      <p className="text-xs text-deep-navy/60 mt-3">
                        <strong>Срок хранения:</strong> до 12 месяцев | <strong>Требуется согласие:</strong> Да
                      </p>
                    </div>
                  </div>
                </div>

                {/* Аналитические */}
                <div className="bg-white rounded-xl p-6 border-2 border-lavender-bg">
                  <div className="flex items-start gap-3 mb-3">
                    <BarChart3 className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                        4.3. Аналитические (производительность)
                      </h3>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Эти cookie помогают нам понимать, как посетители используют сайт.
                      </p>
                      <p className="text-body-small font-semibold text-deep-navy mb-2">Используемые сервисы:</p>
                      <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                        <li><strong>Яндекс.Метрика</strong> — анализ посещаемости, поведения пользователей, популярности материалов</li>
                        <li><strong>Google Analytics</strong> (при использовании) — веб-аналитика</li>
                      </ul>
                      <p className="text-body-small font-semibold text-deep-navy mb-2 mt-3">Что мы узнаем:</p>
                      <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                        <li>Количество посетителей и просмотров страниц</li>
                        <li>Время, проведенное на сайте</li>
                        <li>Источники трафика (откуда вы пришли)</li>
                        <li>Популярные разделы и материалы</li>
                        <li>Эффективность контента</li>
                      </ul>
                      <p className="text-xs text-deep-navy/60 mt-3 italic">
                        <strong>Важно:</strong> Мы получаем только обобщенные данные без идентификации конкретных пользователей.
                      </p>
                      <p className="text-xs text-deep-navy/60 mt-2">
                        <strong>Срок хранения:</strong> до 24 месяцев | <strong>Требуется согласие:</strong> Да
                      </p>
                      <p className="text-xs text-primary-purple mt-2">
                        <a 
                          href="https://yandex.ru/support/metrica/general/opt-out.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          Как отказаться от Яндекс.Метрики
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Маркетинговые */}
                <div className="bg-white rounded-xl p-6 border-2 border-lavender-bg">
                  <div className="flex items-start gap-3 mb-3">
                    <Megaphone className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                        4.4. Маркетинговые и рекламные (таргетинг)
                      </h3>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Эти cookie используются для показа вам релевантной рекламы.
                      </p>
                      <p className="text-body-small font-semibold text-deep-navy mb-2">Используемые платформы:</p>
                      <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                        <li>ВКонтакте Реклама (VK Pixel)</li>
                        <li>Яндекс.Директ</li>
                        <li>Google Ads (при использовании)</li>
                        <li>Telegram Ads (при использовании)</li>
                      </ul>
                      <p className="text-xs text-deep-navy/60 mt-3 italic">
                        <strong>Важно:</strong> Мы не продаем ваши персональные данные рекламным платформам. 
                        Рекламодатели получают только обобщенные анонимные данные об эффективности кампаний.
                      </p>
                      <p className="text-xs text-deep-navy/60 mt-2">
                        <strong>Срок хранения:</strong> до 24 месяцев | <strong>Требуется согласие:</strong> Да
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                5. Как управлять файлами cookie
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">Управление через настройки сайта:</p>
                  <p className="text-body-small text-deep-navy/70">
                    Вы можете в любой момент изменить свои предпочтения относительно cookie на{' '}
                    <Link href="/cookies" className="text-primary-purple hover:text-ocean-wave-start underline font-medium">
                      странице управления cookie
                    </Link>
                    . При первом посещении сайта появится баннер с запросом согласия.
                  </p>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">Управление через браузер:</p>
                  <p className="text-body-small text-deep-navy/70 mb-2">
                    Вы можете управлять cookie через настройки вашего браузера:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                    <li><strong>Google Chrome:</strong> Настройки → Конфиденциальность и безопасность → Файлы cookie</li>
                    <li><strong>Mozilla Firefox:</strong> Настройки → Приватность и защита → Куки и данные сайтов</li>
                    <li><strong>Safari:</strong> Настройки → Конфиденциальность → Управление данными сайтов</li>
                    <li><strong>Яндекс Браузер:</strong> Настройки → Системные → Настройки содержимого → Файлы cookie</li>
                  </ul>
                  <p className="text-xs text-deep-navy/60 mt-3 italic">
                    <strong>Важно:</strong> Полное отключение cookie может привести к нарушению работы сайта.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                6. Срок хранения cookie
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-lavender-bg">
                      <th className="border border-lavender-bg p-3 text-left font-semibold text-deep-navy">Тип cookie</th>
                      <th className="border border-lavender-bg p-3 text-left font-semibold text-deep-navy">Срок хранения</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">Сеансовые</td>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">До закрытия браузера</td>
                    </tr>
                    <tr>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">Строго необходимые</td>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">До 12 месяцев</td>
                    </tr>
                    <tr>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">Функциональные</td>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">До 12 месяцев</td>
                    </tr>
                    <tr>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">Аналитические</td>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">До 24 месяцев</td>
                    </tr>
                    <tr>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">Маркетинговые</td>
                      <td className="border border-lavender-bg p-3 text-body-small text-deep-navy/80">До 24 месяцев</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-body-small text-deep-navy/70 mt-4">
                После истечения срока cookie автоматически удаляются. Вы также можете удалить их вручную в любое время через настройки браузера.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                7. Ваши права
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>В соответствии с ФЗ-152 «О персональных данных» вы имеете право:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Знать, какие данные мы собираем и как их используем</li>
                  <li>Отозвать согласие на обработку персональных данных</li>
                  <li>Требовать удаления ваших данных</li>
                  <li>Получить копию ваших данных</li>
                  <li>Исправить неточные данные</li>
                  <li>Ограничить обработку данных</li>
                </ul>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">Для реализации своих прав свяжитесь с нами:</p>
                  <p className="text-body-small text-deep-navy/70">
                    Email: <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline">bez-pauzy@yandex.com</a>
                  </p>
                  <p className="text-body-small text-deep-navy/70 mt-2">
                    Мы ответим на ваш запрос в течение 10 рабочих дней в соответствии с законодательством РФ.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                8. Контактная информация
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Если у вас есть вопросы о нашей Политике использования файлов cookie, свяжитесь с нами:</p>
                <div className="bg-lavender-bg rounded-xl p-4 space-y-2">
                  <p className="text-body-small text-deep-navy/70">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline">
                      bez-pauzy@yandex.com
                    </a>
                  </p>
                  <p className="text-body-small text-deep-navy/70">
                    <strong>Telegram:</strong>{' '}
                    <a href="https://t.me/bezpauzy_bot" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">
                      @bezpauzy_bot
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                9. Жалобы в контролирующие органы
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Если вы считаете, что ваши права нарушены, вы можете подать жалобу в:</p>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">
                    Роскомнадзор (Федеральная служба по надзору в сфере связи, информационных технологий и массовых коммуникаций)
                  </p>
                  <ul className="list-none space-y-1 text-body-small text-deep-navy/70">
                    <li>Адрес: 109074, г. Москва, Китайгородский проезд, д. 7, стр. 2</li>
                    <li>Телефон: 8 (495) 987-68-00</li>
                    <li>
                      Сайт:{' '}
                      <a href="https://rkn.gov.ru" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">
                        rkn.gov.ru
                      </a>
                    </li>
                    <li>
                      Email:{' '}
                      <a href="mailto:rsoc@rkn.gov.ru" className="text-primary-purple hover:underline">
                        rsoc@rkn.gov.ru
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Back buttons */}
            <div className="pt-8 border-t border-lavender-bg flex flex-col sm:flex-row gap-4">
              <Link
                href="/legal"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple/5 transition-colors"
              >
                ← Все правовые документы
              </Link>
              <Link
                href="/cookies"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Управление cookie
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

export default CookiePolicyPage
