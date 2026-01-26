import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Mail, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Подписка подтверждена | Без |Паузы',
  description: 'Ваша подписка на рассылку успешно подтверждена',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SubscriptionConfirmedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-strong border border-lavender-bg text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-ocean-wave-start/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-ocean-wave-start" />
          </div>

          {/* Title */}
          <h1 className="text-h2 font-bold text-deep-navy mb-4">
            Подписка подтверждена! 🎉
          </h1>

          {/* Description */}
          <p className="text-body-large text-deep-navy/70 mb-6">
            Спасибо за подтверждение подписки на рассылку <strong>Без |Паузы</strong>.
          </p>

          <div className="bg-lavender-bg/50 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <Mail className="w-6 h-6 text-primary-purple flex-shrink-0 mt-1" />
              <div>
                <p className="text-body font-semibold text-deep-navy mb-2">
                  Приветственное письмо отправлено
                </p>
                <p className="text-body-small text-deep-navy/70">
                  Мы отправили вам приветственное письмо с информацией о том, что вас ждёт в рассылке.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="text-left mb-8 space-y-3">
            <p className="text-body font-semibold text-deep-navy mb-3">
              Теперь вы будете получать:
            </p>
            <ul className="space-y-2 text-body-small text-deep-navy/70">
              <li className="flex items-start gap-2">
                <span className="text-primary-purple mt-1">•</span>
                <span>Научно обоснованные статьи о менопаузе</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-purple mt-1">•</span>
                <span>Рекомендации от гинекологов, маммологов и нутрициологов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-purple mt-1">•</span>
                <span>Новости о новых исследованиях</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-purple mt-1">•</span>
                <span>Практические советы для поддержания здоровья</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <Link href="/">
            <Button variant="primary" className="w-full">
              <Home className="w-5 h-5 mr-2" />
              Вернуться на главную
            </Button>
          </Link>

          {/* Footer Note */}
          <p className="text-xs text-deep-navy/50 mt-6">
            Письма будут приходить раз в неделю. Отписаться можно в любой момент.
          </p>
        </div>
      </div>
    </main>
  )
}
