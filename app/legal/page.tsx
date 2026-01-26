import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { Shield, Cookie, FileText, ArrowRight, Lock, Eye, Database } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Правовые документы | Без |Паузы',
  description: 'Политика конфиденциальности, политика использования cookie и другие правовые документы проекта Без |Паузы',
}

const LegalPage: FC = () => {
  const documents = [
    {
      title: 'Политика конфиденциальности',
      description: 'Как мы собираем, используем и защищаем ваши персональные данные в соответствии с ФЗ-152 и GDPR',
      href: '/privacy',
      icon: Shield,
      color: 'from-primary-purple to-ocean-wave-start',
      bgColor: 'bg-primary-purple/10',
      borderColor: 'border-primary-purple/20',
    },
    {
      title: 'Политика использования cookie',
      description: 'Подробная информация о том, какие cookie мы используем, зачем и как вы можете управлять ими',
      href: '/legal/cookies',
      icon: Cookie,
      color: 'from-ocean-wave-start to-primary-purple',
      bgColor: 'bg-ocean-wave-start/10',
      borderColor: 'border-ocean-wave-start/20',
    },
    {
      title: 'Публичная оферта',
      description: 'Условия продажи цифровых товаров (электронных гайдов) на сайте',
      href: '/legal/offer',
      icon: FileText,
      color: 'from-deep-navy to-primary-purple',
      bgColor: 'bg-deep-navy/10',
      borderColor: 'border-deep-navy/20',
    },
  ]

  const botDocuments = [
    {
      title: 'Пользовательское соглашение Telegram-бота',
      description: 'Условия использования Telegram-бота «Без | паузы» для ассистента Евы',
      href: '/bot/terms',
      icon: FileText,
      color: 'from-primary-purple to-ocean-wave-start',
      bgColor: 'bg-primary-purple/10',
      borderColor: 'border-primary-purple/20',
    },
    {
      title: 'Политика конфиденциальности Telegram-бота',
      description: 'Политика обработки персональных данных при использовании Telegram-бота «Без | паузы»',
      href: '/bot/privacy',
      icon: Shield,
      color: 'from-ocean-wave-start to-primary-purple',
      bgColor: 'bg-ocean-wave-start/10',
      borderColor: 'border-ocean-wave-start/20',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Правовые документы
            </h1>
            <p className="text-body-large text-deep-navy/70 max-w-2xl mx-auto">
              Ознакомьтесь с нашими политиками и условиями использования сервиса. 
              Мы соблюдаем требования российского законодательства и международных стандартов защиты данных.
            </p>
          </div>

          {/* Website Documents Grid */}
          <div className="mb-12">
            <h2 className="text-h3 font-bold text-deep-navy mb-6 text-center">
              Документы сайта
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.map((doc) => {
                const Icon = doc.icon
                return (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className="group block"
                  >
                    <div className={`bg-white rounded-2xl p-8 border-2 ${doc.borderColor} hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
                      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${doc.color} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-h4 font-bold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors">
                        {doc.title}
                      </h2>
                      <p className="text-body text-deep-navy/70 mb-6 flex-grow">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary-purple font-semibold group-hover:gap-3 transition-all">
                        <span>Читать документ</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Bot Documents Grid */}
          <div className="mb-12 pt-12 border-t border-lavender-bg">
            <h2 className="text-h3 font-bold text-deep-navy mb-6 text-center">
              Документы Telegram-бота «Без | паузы»
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {botDocuments.map((doc) => {
                const Icon = doc.icon
                return (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className="group block"
                  >
                    <div className={`bg-white rounded-2xl p-8 border-2 ${doc.borderColor} hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
                      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${doc.color} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-h4 font-bold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors">
                        {doc.title}
                      </h2>
                      <p className="text-body text-deep-navy/70 mb-6 flex-grow">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary-purple font-semibold group-hover:gap-3 transition-all">
                        <span>Читать документ</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-lavender-bg rounded-2xl p-8 mb-8">
            <h3 className="text-h4 font-bold text-deep-navy mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary-purple" />
              Ваши права и безопасность
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-purple/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary-purple" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-deep-navy mb-2">
                      Право на доступ к данным
                    </h4>
                    <p className="text-body-small text-deep-navy/70">
                      Вы можете запросить информацию о том, какие ваши данные мы обрабатываем
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-ocean-wave-start/10 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-ocean-wave-start" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-deep-navy mb-2">
                      Управление cookie
                    </h4>
                    <p className="text-body-small text-deep-navy/70">
                      Настройте использование cookie в любое время на{' '}
                      <Link href="/cookies" className="text-primary-purple hover:underline font-medium">
                        странице управления
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <h3 className="text-h4 font-bold text-deep-navy mb-4">
              Вопросы по правовым документам?
            </h3>
            <p className="text-body text-deep-navy/70 mb-6">
              Если у вас есть вопросы о наших политиках или вы хотите реализовать свои права, 
              свяжитесь с нами:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:bez-pauzy@yandex.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Написать на email
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple/5 transition-colors"
              >
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LegalPage
