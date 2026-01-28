'use client'

import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelPage() {
  const router = useRouter()

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
          className="w-24 h-24 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-16 h-16 text-error" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-deep-navy mb-4">
          Платёж отменён
        </h1>

        <p className="text-xl text-deep-navy/70 mb-8">
          Оплата не была завершена. Если у вас возникли проблемы, свяжитесь с нами.
        </p>

        <div className="bg-lavender-bg rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-deep-navy mb-4">Что могло пойти не так?</h3>
          <ul className="space-y-3 text-left text-sm text-deep-navy/70">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-primary-purple rounded-full mt-2 flex-shrink-0" />
              <span>Платёж был отменён вами</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-primary-purple rounded-full mt-2 flex-shrink-0" />
              <span>Недостаточно средств на карте</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-primary-purple rounded-full mt-2 flex-shrink-0" />
              <span>Технические проблемы с платёжной системой</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/payment/subscribe"
            className="flex-1 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Попробовать снова</span>
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white border-2 border-primary-purple text-primary-purple px-8 py-4 rounded-full font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>На главную</span>
          </Link>
        </div>

        <p className="mt-8 text-sm text-deep-navy/60">
          Нужна помощь?{' '}
          <Link href="/contact" className="text-primary-purple hover:underline font-medium">
            Свяжитесь с нами
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
