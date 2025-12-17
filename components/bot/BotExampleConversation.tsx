'use client'

import { FC } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface BotExampleConversationProps {}

export const BotExampleConversation: FC<BotExampleConversationProps> = () => {
  const messages = [
    {
      type: 'user',
      text: 'У меня приливы по 10 раз в день, это нормально?',
    },
    {
      type: 'bot',
      text: 'Приливы 10 раз в день — это довольно часто, но не редкость в перименопаузе. По данным исследований, до 75% женщин испытывают приливы, и их частота может варьироваться от нескольких раз в неделю до десятков раз в день.',
    },
    {
      type: 'bot',
      text: 'Важно понимать, что это связано с колебаниями уровня эстрогена. Если приливы сильно мешают вашей повседневной жизни, стоит обсудить это с гинекологом. Могу порекомендовать врачей в вашем городе.',
    },
    {
      type: 'user',
      text: 'А что можно сделать прямо сейчас?',
    },
    {
      type: 'bot',
      text: 'Вот несколько способов, которые могут помочь:\n\n1. Одевайтесь слоями — легко снять лишнее\n2. Избегайте триггеров: острая еда, алкоголь, стресс\n3. Дышите глубоко при начале прилива\n4. Прохладный душ перед сном\n\nТакже могу подобрать видео с упражнениями для облегчения приливов.',
    },
  ]

  return (
    <section id="example" className="py-16 md:py-24 bg-lavender-bg relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-h2 font-bold text-deep-navy text-center mb-4">
            Пример диалога с Евой
          </h2>
          <p className="text-body-large text-deep-navy/70 text-center mb-12">
            Посмотрите, как Ева отвечает на реальные вопросы
          </p>

          {/* Grid: Photo + Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Photo */}
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-strong order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src="/hero-women.jpg"
                alt="Женщины используют ассистента Еву"
                width={600}
                height={800}
                className="w-full h-auto object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-lavender-bg/30 to-transparent" />
            </motion.div>

            {/* Chat container */}
            <div className="bg-white rounded-3xl shadow-strong p-6 md:p-8 border border-lavender-bg order-1 lg:order-2">
            {/* Chat header */}
            <div className="flex items-center gap-3 pb-4 border-b border-lavender-bg mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <div className="font-semibold text-deep-navy">Ева</div>
                <div className="text-xs text-deep-navy/60">Онлайн</div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 shadow-md ${
                      message.type === 'user'
                        ? 'bg-primary-purple text-white rounded-tr-none'
                        : 'bg-lavender-bg text-deep-navy rounded-tl-none border border-primary-purple/10'
                    }`}
                  >
                    <p className="text-sm md:text-base whitespace-pre-line leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Typing indicator */}
            <motion.div
              className="flex justify-start mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: messages.length * 0.2 }}
            >
              <div className="flex gap-1.5 px-4 py-2">
                <div className="w-2 h-2 bg-primary-purple/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-primary-purple/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary-purple/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

