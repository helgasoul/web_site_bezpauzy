'use client'

import { FC } from 'react'
import { MessageSquare, Brain, CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface BotHowItWorksProps {}

export const BotHowItWorks: FC<BotHowItWorksProps> = () => {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Задаете вопрос',
      description: 'Голосом или текстом в Telegram',
      color: 'from-primary-purple/20 to-primary-purple/10',
    },
    {
      icon: Brain,
      title: 'Ева анализирует',
      description: 'Историю + научные источники',
      color: 'from-ocean-wave-start/20 to-ocean-wave-end/10',
    },
    {
      icon: CheckCircle,
      title: 'Получаете ответ',
      description: 'Персонализированный и научный',
      color: 'from-warm-accent/20 to-warm-accent/10',
    },
    {
      icon: ArrowRight,
      title: 'Действуете',
      description: 'Врачи, видео, чек-листы',
      color: 'from-primary-purple/20 to-ocean-wave-start/10',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.h2
          className="text-h2 font-bold text-deep-navy text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Как работает Ева?
        </motion.h2>
        
        <motion.p
          className="text-body-large text-deep-navy/70 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Простой процесс от вопроса до решения
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                {/* Connecting line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary-purple/30 to-transparent -z-10" style={{ width: 'calc(100% - 80px)' }} />
                )}

                <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-md border-4 border-white">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 mt-4`}>
                    <Icon className="w-10 h-10 text-primary-purple" />
                  </div>

                  {/* Content */}
                  <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                    {step.title}
                  </h3>
                  <p className="text-body text-deep-navy/70">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}






