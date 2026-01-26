import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { FileText, Shield, Lock, Eye, Database, UserCheck, Mail, AlertCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | Без |Паузы',
  description: 'Политика конфиденциальности и обработки персональных данных проекта Без |Паузы в соответствии с ФЗ-152 и GDPR',
}

const PrivacyPolicyPage: FC = () => {
  const lastUpdated = new Date().toLocaleDateString('ru-RU', { 
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Политика конфиденциальности
            </h1>
            <p className="text-body-large text-deep-navy/70">
              bezpauzy.com
            </p>
            <p className="text-body text-deep-navy/60 mt-2">
              Последнее обновление: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary-purple" />
                1. Общие положения
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">1.1. Основная информация</h3>
                  <p>
                    Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты 
                    персональных данных пользователей сайта bezpauzy.com (далее — Сайт).
                  </p>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">Оператор персональных данных:</p>
                  <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                    <li>Email: <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline">bez-pauzy@yandex.com</a></li>
                    <li>Telegram: <a href="https://t.me/bezpauzy_bot" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">@bezpauzy_bot</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">1.2. Правовые основания</h3>
                  <p>Обработка персональных данных осуществляется в соответствии с:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных»</li>
                    <li>Федеральным законом от 27.07.2006 № 149-ФЗ «Об информации, информационных технологиях и о защите информации»</li>
                    <li>Постановлениями Правительства РФ</li>
                    <li>Приказами и требованиями Роскомнадзора</li>
                    <li>Регламентом (ЕС) 2016/679 (GDPR)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">1.3. Действие Политики</h3>
                  <p>
                    Политика применяется ко всей информации, которую Сайт может получить о пользователе во время 
                    использования им Сайта, сервисов, программ и продуктов.
                  </p>
                  <p className="mt-2">
                    Использование Сайта означает безоговорочное согласие пользователя с настоящей Политикой и 
                    указанными в ней условиями обработки его персональной информации.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary-purple" />
                2. Персональные данные, которые мы собираем
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">2.1. Данные, предоставляемые добровольно:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>При регистрации на Сайте:</strong> имя, адрес электронной почты, дата рождения (для возрастной категории), номер телефона (опционально)</li>
                    <li><strong>При подписке на рассылку:</strong> имя, email</li>
                    <li><strong>При использовании калькуляторов здоровья:</strong> возраст, рост, вес, другие показатели здоровья (анонимно или с привязкой к аккаунту по выбору пользователя)</li>
                    <li><strong>При оставлении комментариев:</strong> имя, email, текст комментария</li>
                    <li><strong>При обращении в поддержку:</strong> имя, email, суть обращения</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-body-small text-yellow-900">
                        <strong>Важно:</strong> Мы не собираем и не храним медицинские диагнозы. Данные, вводимые в калькуляторы здоровья, 
                        используются только для расчетов и не передаются третьим лицам.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">2.2. Данные, собираемые автоматически:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP-адрес</li>
                    <li>Информация из cookies</li>
                    <li>Информация о браузере и устройстве</li>
                    <li>Данные о посещенных страницах</li>
                    <li>Время, проведенное на Сайте</li>
                    <li>Источник перехода на Сайт</li>
                    <li>Операционная система</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">2.3. Данные от третьих лиц:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Информация из социальных сетей (при авторизации через Telegram)</li>
                    <li>Данные от платежных систем (при оплате продуктов)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary-purple" />
                3. Цели обработки персональных данных
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Мы используем ваши данные для:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <h4 className="font-semibold text-deep-navy mb-2">3.1. Предоставления услуг:</h4>
                    <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                      <li>Регистрация и идентификация на Сайте</li>
                      <li>Предоставление доступа к контенту</li>
                      <li>Работа калькуляторов и инструментов</li>
                      <li>Обработка заказов и платежей</li>
                      <li>Техническая поддержка</li>
                    </ul>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <h4 className="font-semibold text-deep-navy mb-2">3.2. Коммуникации:</h4>
                    <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                      <li>Отправка информационных рассылок</li>
                      <li>Уведомления о новых материалах</li>
                      <li>Ответы на обращения</li>
                      <li>Проведение опросов</li>
                    </ul>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <h4 className="font-semibold text-deep-navy mb-2">3.3. Улучшения Сайта:</h4>
                    <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                      <li>Анализ использования Сайта</li>
                      <li>Улучшение функционала</li>
                      <li>Персонализация контента</li>
                      <li>Тестирование новых функций</li>
                    </ul>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <h4 className="font-semibold text-deep-navy mb-2">3.4. Безопасности:</h4>
                    <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                      <li>Предотвращение мошенничества</li>
                      <li>Защита от спама</li>
                      <li>Обеспечение безопасности данных</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                4. Правовые основания обработки
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>Обработка персональных данных осуществляется на основании:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Согласия субъекта</strong> на обработку его персональных данных</li>
                  <li><strong>Договора</strong>, стороной которого является субъект персональных данных</li>
                  <li><strong>Законных интересов</strong> оператора (аналитика, безопасность)</li>
                  <li><strong>Требований законодательства РФ</strong></li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                5. Условия обработки и передачи данных
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">5.1. Хранение данных</h3>
                  <p>
                    Все персональные данные пользователей хранятся на серверах, расположенных на территории 
                    Российской Федерации, в соответствии с требованиями ФЗ-152.
                  </p>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">5.2. Срок хранения</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Данные зарегистрированных пользователей — до удаления аккаунта + 3 года (для целей бухгалтерского учета)</li>
                    <li>Данные подписчиков рассылки — до отписки</li>
                    <li>Cookies — согласно настройкам браузера и срокам, указанным в{' '}
                      <Link href="/legal/cookies" className="text-primary-purple hover:underline">Политике использования cookies</Link>
                    </li>
                    <li>Логи сервера — 6 месяцев</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">5.3. Передача данных третьим лицам</h3>
                  <p>Мы можем передавать ваши данные третьим лицам в следующих случаях:</p>
                  <div className="bg-lavender-bg rounded-xl p-4 mt-3">
                    <p className="font-semibold text-deep-navy mb-2">С вашего согласия:</p>
                    <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                      <li>Партнерам для предоставления услуг (с вашего разрешения)</li>
                    </ul>
                    <p className="font-semibold text-deep-navy mb-2 mt-4">Без дополнительного согласия (на основании закона):</p>
                    <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                      <li><strong>Поставщикам услуг:</strong> Яндекс.Метрика (аналитика), хостинг-провайдеры, платежные системы</li>
                      <li><strong>Государственным органам</strong> — при наличии законного запроса</li>
                    </ul>
                    <p className="text-xs text-deep-navy/60 mt-3 italic">
                      Все поставщики услуг соответствуют требованиям ФЗ-152 и обязаны обеспечивать конфиденциальность данных.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                6. Обработка персональных данных несовершеннолетних
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">6.1. Возрастные ограничения</p>
                  <p className="text-body-small text-deep-navy/70">
                    Сайт предназначен для лиц старше 18 лет. Мы сознательно не собираем персональные данные лиц младше 18 лет.
                  </p>
                  <p className="font-semibold text-deep-navy mb-2 mt-3">6.2. Согласие родителей</p>
                  <p className="text-body-small text-deep-navy/70">
                    Если нам станет известно, что мы собрали персональные данные несовершеннолетнего без согласия родителей/законных 
                    представителей, мы удалим эту информацию в кратчайшие сроки.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                7. Использование cookies и аналитики
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  Сайт использует файлы cookies для аутентификации пользователей, запоминания настроек, аналитики посещаемости 
                  и улучшения функционала.
                </p>
                <p>
                  Подробная информация о типах cookie, сроках хранения и управлении настройками доступна в{' '}
                  <Link href="/legal/cookies" className="text-primary-purple hover:underline font-medium">
                    Политике использования cookies
                  </Link>
                  .
                </p>
                <p>
                  Вы можете управлять настройками cookie на{' '}
                  <Link href="/cookies" className="text-primary-purple hover:underline font-medium">
                    странице управления cookie
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary-purple" />
                8. Меры защиты данных
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">8.1. Технические меры:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Шифрование данных (SSL/TLS)</li>
                    <li>Защищенное соединение (HTTPS)</li>
                    <li>Регулярное резервное копирование</li>
                    <li>Защита от несанкционированного доступа</li>
                    <li>Антивирусная защита</li>
                    <li>Firewall и системы обнаружения вторжений</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">8.2. Организационные меры:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Доступ к данным имеют только уполномоченные лица</li>
                    <li>Обучение сотрудников правилам обработки ПД</li>
                    <li>Контроль соблюдения требований безопасности</li>
                    <li>Регулярный аудит безопасности</li>
                  </ul>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">8.3. Уведомление об инцидентах</h3>
                  <p className="text-body-small text-deep-navy/70">
                    В случае утечки или несанкционированного доступа к данным мы:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4 mt-2">
                    <li>Уведомим Роскомнадзор в течение 24 часов</li>
                    <li>Уведомим затронутых пользователей в течение 72 часов</li>
                    <li>Примем меры по устранению последствий</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary-purple" />
                9. Ваши права
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>В соответствии с ФЗ-152 вы имеете право:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.1. Право на доступ</p>
                    <p className="text-body-small text-deep-navy/70">Получить информацию о том, какие ваши данные мы обрабатываем</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.2. Право на исправление</p>
                    <p className="text-body-small text-deep-navy/70">Исправить неточные или неполные данные</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.3. Право на удаление</p>
                    <p className="text-body-small text-deep-navy/70">Запросить удаление ваших данных (право на забвение)</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.4. Право на ограничение обработки</p>
                    <p className="text-body-small text-deep-navy/70">Ограничить обработку ваших данных в определенных случаях</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.5. Право на отзыв согласия</p>
                    <p className="text-body-small text-deep-navy/70">Отозвать согласие на обработку данных в любое время</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.6. Право на получение копии</p>
                    <p className="text-body-small text-deep-navy/70">Получить копию ваших данных в структурированном формате</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.7. Право на возражение</p>
                    <p className="text-body-small text-deep-navy/70">Возразить против обработки данных в маркетинговых целях</p>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-4">
                    <p className="font-semibold text-deep-navy mb-1">9.8. Право на обжалование</p>
                    <p className="text-body-small text-deep-navy/70">Обратиться в Роскомнадзор или суд при нарушении ваших прав</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                10. Как реализовать свои права
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">10.1. Самостоятельно:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>В личном кабинете на Сайте</li>
                    <li>Отписка от рассылки по ссылке в письме</li>
                    <li>Настройки cookies в браузере или на{' '}
                      <Link href="/cookies" className="text-primary-purple hover:underline">странице управления cookie</Link>
                    </li>
                  </ul>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">10.2. Запрос к оператору:</h3>
                  <p className="text-body-small text-deep-navy/70 mb-3">
                    Для реализации ваших прав направьте запрос на{' '}
                    <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline font-medium">
                      bez-pauzy@yandex.com
                    </a>
                    {' '}или через форму обратной связи на Сайте.
                  </p>
                  <p className="font-semibold text-deep-navy mb-2">Мы обязуемся:</p>
                  <ul className="list-disc list-inside space-y-1 text-body-small text-deep-navy/70 ml-4">
                    <li>Подтвердить получение запроса — в течение 1 рабочего дня</li>
                    <li>Рассмотреть запрос — в течение 7 рабочих дней</li>
                    <li>Предоставить ответ — в течение 10 рабочих дней (максимум 30 дней в сложных случаях)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                11. Рассылки и маркетинг
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">11.1. Типы рассылок:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Информационные (новые статьи, подкасты)</li>
                    <li>Образовательные (материалы о здоровье)</li>
                    <li>Маркетинговые (специальные предложения)</li>
                    <li>Транзакционные (подтверждения, уведомления)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">11.2. Отписка</h3>
                  <p>Вы можете отписаться от рассылок:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>По ссылке в каждом письме</li>
                    <li>В настройках личного кабинета</li>
                    <li>Отправив запрос на <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline">bez-pauzy@yandex.com</a></li>
                  </ul>
                  <p className="text-sm text-deep-navy/60 italic mt-3">
                    <strong>Примечание:</strong> От транзакционных писем (подтверждения регистрации, восстановление пароля) отписаться нельзя.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                12. Ссылки на сторонние сайты
              </h2>
              <div className="text-body text-deep-navy/80">
                <p>
                  Сайт может содержать ссылки на сторонние ресурсы. Мы не несем ответственности за политику конфиденциальности 
                  и содержание таких сайтов. Рекомендуем ознакомиться с политикой конфиденциальности каждого посещаемого сайта.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                13. Изменения в Политике конфиденциальности
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">13.1. Обновления</h3>
                  <p>
                    Мы оставляем за собой право вносить изменения в настоящую Политику. При внесении существенных изменений мы:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Опубликуем новую версию на Сайте</li>
                    <li>Уведомим по email за 10 дней до вступления в силу</li>
                    <li>Запросим повторное согласие (если требуется по закону)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-2">13.2. Согласие с изменениями</h3>
                  <p>
                    Продолжение использования Сайта после публикации новой версии означает согласие с изменениями.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary-purple" />
                14. Контактная информация
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">По вопросам обработки персональных данных:</p>
                  <ul className="list-none space-y-2 text-body-small text-deep-navy/70">
                    <li>
                      <strong>Email:</strong>{' '}
                      <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline">
                        bez-pauzy@yandex.com
                      </a>
                    </li>
                    <li>
                      <strong>Telegram:</strong>{' '}
                      <a href="https://t.me/bezpauzy_bot" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline">
                        @bezpauzy_bot
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="font-semibold text-deep-navy mb-2">Роскомнадзор (регулятор):</p>
                  <ul className="list-none space-y-1 text-body-small text-deep-navy/70">
                    <li>
                      Официальный сайт:{' '}
                      <a href="https://rkn.gov.ru" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline flex items-center gap-1">
                        rkn.gov.ru
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>Телефон горячей линии: 8 (800) 707-77-07</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                15. Согласие на обработку персональных данных
              </h2>
              <div className="bg-lavender-bg rounded-xl p-4">
                <p className="text-body text-deep-navy/80 mb-3">
                  Используя Сайт, регистрируясь или оставляя свои данные, вы подтверждаете, что:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-body-small text-deep-navy/70 ml-4">
                  <li>Ознакомились с настоящей Политикой конфиденциальности</li>
                  <li>Даете согласие на обработку ваших персональных данных в целях, указанных в Политике</li>
                  <li>Понимаете свои права и способы их реализации</li>
                  <li>Подтверждаете, что достигли 18 лет</li>
                </ol>
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

export default PrivacyPolicyPage
