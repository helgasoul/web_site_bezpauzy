'use client'

import { FC, useState, FormEvent } from 'react'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface NewsletterFormProps {
  source?: string
  showNameField?: boolean
  className?: string
  onSuccess?: () => void
}

export const NewsletterForm: FC<NewsletterFormProps> = ({
  source = 'newsletter_page',
  showNameField = true,
  className = '',
  onSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
        setName('')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(data.error || 'Произошла ошибка при подписке')
      }
    } catch (err) {
      setError('Произошла ошибка сети. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`bg-ocean-wave-start/10 border-2 border-ocean-wave-start rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-ocean-wave-start/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-ocean-wave-start" />
          </div>
          <h3 className="text-h4 font-bold text-deep-navy mb-2">
            Спасибо за подписку!
          </h3>
          <p className="text-body-small text-deep-navy/70">
            Проверьте почту для подтверждения подписки
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {showNameField && (
        <div>
          <label htmlFor="newsletter-name" className="block text-body-small font-semibold text-deep-navy mb-2">
            Имя (необязательно)
          </label>
          <input
            id="newsletter-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться?"
            className="w-full px-4 py-3 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors"
            aria-label="Ваше имя"
          />
        </div>
      )}

      <div>
        <label htmlFor="newsletter-email" className="block text-body-small font-semibold text-deep-navy mb-2">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" aria-hidden="true" />
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Email адрес"
            aria-required="true"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4" role="alert">
          <p className="text-body-small text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full"
        aria-label={isSubmitting ? 'Отправка...' : 'Подписаться на рассылку'}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            Подписаться
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      <p className="text-xs text-deep-navy/50 text-center">
        Нажимая кнопку &quot;Подписаться&quot;, вы соглашаетесь с{' '}
        <Link href="/privacy" className="underline hover:text-primary-purple">
          политикой конфиденциальности
        </Link>
        . Отписаться можно в любой момент.
      </p>
    </form>
  )
}
