'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { FAQAccordion } from '@/components/community/FAQAccordion'

interface BookFAQProps {}

export const BookFAQ: FC<BookFAQProps> = () => {
  const faqs = [
    {
      question: 'Когда выйдет книга?',
      answer:
        'Книга выйдет весной 2026 года. Предзаказы принимаются до 31 марта 2026. После релиза вы получите книгу одним из первых.',
    },
    {
      question: 'Будет ли электронная версия?',
      answer:
        'Да, будет доступна электронная версия в формате PDF. При предзаказе вы можете выбрать электронную или печатную версию.',
    },
    {
      question: 'Можно ли купить книгу в другой стране?',
      answer:
        'Печатная версия пока доставляется только по России. Электронная версия доступна для скачивания из любой страны.',
    },
    {
      question: 'Как получить бонус (1 месяц Paid1)?',
      answer:
        'Бонус активируется автоматически после оплаты предзаказа. Вы получите код активации на email вместе с подтверждением заказа. Код можно использовать для активации подписки в боте Ева.',
    },
    {
      question: 'Что делать, если передумал?',
      answer:
        'Вы можете отменить предзаказ до момента оплаты. После оплаты возврат средств возможен до релиза книги (до 31 марта 2026). Свяжитесь с нами по email: bez-pauzy@yandex.com',
    },
    {
      question: 'Как быстро доставят книгу?',
      answer:
        'Электронная версия будет отправлена сразу после релиза. Печатная версия будет доставлена в течение 2-3 недель после релиза книги в зависимости от региона.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-primary-purple" />
            <span className="text-body-small font-semibold text-primary-purple">
              Вопросы о книге
            </span>
          </div>
          <h2 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-body-large text-deep-navy/70 max-w-2xl mx-auto">
            Ответы на популярные вопросы о книге, доставке и бонусах
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <FAQAccordion items={faqs} />
        </div>
      </div>
    </section>
  )
}

