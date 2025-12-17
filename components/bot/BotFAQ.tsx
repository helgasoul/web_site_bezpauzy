'use client'

import { FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BotFAQProps {}

export const BotFAQ: FC<BotFAQProps> = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'Как начать пользоваться ассистентом?',
      answer: 'Просто откройте ассистента в Telegram по ссылке или найдите @bezpauzy_bot. Нажмите "Начать" и следуйте инструкциям. Первые 10 вопросов в день — бесплатно.',
    },
    {
      question: 'Платная ли подписка?',
      answer: 'Нет, базовый тариф Free — бесплатный навсегда. Вы получаете 10 вопросов в день и доступ к базовым функциям. Платные тарифы дают больше возможностей: неограниченные вопросы, доступ к врачам, видео-курсы.',
    },
    {
      question: 'Насколько точны ответы Евы?',
      answer: 'Ева использует научную базу знаний, проверенную врачами. Все ответы основаны на актуальных медицинских исследованиях и рекомендациях. Однако Ева не заменяет консультацию врача — она даёт образовательную информацию.',
    },
    {
      question: 'Мои данные в безопасности?',
      answer: 'Да. Все данные зашифрованы, мы соблюдаем ФЗ-152 о защите персональных данных. Ваши сообщения не передаются третьим лицам. Подробнее в Политике конфиденциальности.',
    },
    {
      question: 'Можно ли отменить подписку?',
      answer: 'Да, в любой момент. Отмена происходит в настройках ассистента или через поддержку. После отмены вы вернётесь на бесплатный тариф.',
    },
    {
      question: 'Ева работает 24/7?',
      answer: 'Да! Ева доступна круглосуточно. Вы можете задавать вопросы в любое время, и получите ответ в течение нескольких секунд.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2
          className="text-h2 font-bold text-deep-navy text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Часто задаваемые вопросы
        </motion.h2>
        
        <motion.p
          className="text-body-large text-deep-navy/70 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Ответы на самые популярные вопросы об ассистенте Ева
        </motion.p>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-card border border-lavender-bg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-lavender-bg/30 transition-colors"
              >
                <span className="text-h5 font-semibold text-deep-navy pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary-purple flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-body text-deep-navy/70">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

