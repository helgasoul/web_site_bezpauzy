'use client'

import { FC, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    // Небольшая задержка для обработки webhook
    const timer = setTimeout(() => {
      setLoading(false)
      setVerified(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lavender-bg to-white">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-purple animate-spin mx-auto mb-4" />
          <p className="text-lg text-deep-navy/70">Обрабатываем платёж...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lavender-bg to-white px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-16 h-16 text-success" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-deep-navy mb-4">
          Платёж успешно завершён!
        </h1>

        <p className="text-xl text-deep-navy/70 mb-8">
          Спасибо за подписку! Теперь у вас есть полный доступ к Еве.
        </p>

        <div className="bg-lavender-bg rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-deep-navy mb-4">Что дальше?</h3>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
              <span className="text-deep-navy/80">
                Ваша подписка активирована автоматически
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
              <span className="text-deep-navy/80">
                Можете начать общаться с Евой прямо сейчас
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
              <span className="text-deep-navy/80">
                Диалоги синхронизируются между сайтом и Telegram
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/chat"
            className="flex-1 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Начать общение с Евой</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white border-2 border-primary-purple text-primary-purple px-8 py-4 rounded-full font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
          >
            На главную
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
