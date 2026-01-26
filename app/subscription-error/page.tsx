import { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Ошибка подтверждения подписки | Без |Паузы',
  description: 'Не удалось подтвердить подписку на рассылку',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SubscriptionErrorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-strong border border-lavender-bg text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-h2 font-bold text-deep-navy mb-4">
            Ошибка подтверждения подписки
          </h1>

          {/* Description */}
          <p className="text-body-large text-deep-navy/70 mb-6">
            К сожалению, не удалось подтвердить вашу подписку. Возможные причины:
          </p>

          {/* Reasons List */}
          <div className="text-left mb-8 space-y-3">
            <ul className="space-y-2 text-body-small text-deep-navy/70">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Ссылка подтверждения устарела или недействительна</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Подписка уже была подтверждена ранее</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Произошла техническая ошибка</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/newsletter">
              <Button variant="primary" className="w-full">
                <Mail className="w-5 h-5 mr-2" />
                Подписаться заново
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" className="w-full">
                <Home className="w-5 h-5 mr-2" />
                Вернуться на главную
              </Button>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-deep-navy/50 mt-6">
            Если проблема повторяется, пожалуйста,{' '}
            <Link href="/support" className="underline hover:text-primary-purple">
              свяжитесь с поддержкой
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
