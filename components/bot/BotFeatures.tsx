'use client'

import { FC, useState } from 'react'
import { MessageCircle, Users, Video, ClipboardList, Bell, Heart, ThumbsUp, ThumbsDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface BotFeaturesProps {}

export const BotFeatures: FC<BotFeaturesProps> = () => {
  const [reminderVote, setReminderVote] = useState<'up' | 'down' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voteMessage, setVoteMessage] = useState<string | null>(null)
  const features = [
    {
      icon: MessageCircle,
      title: 'Отвечать на вопросы',
      description: 'На основе научных источников и вашей истории',
      gradient: 'from-primary-purple/30 to-primary-purple/10',
    },
    {
      icon: Users,
      title: 'Рекомендовать врачей',
      description: '500+ специалистов в базе по всей России и СНГ',
      gradient: 'from-ocean-wave-start/30 to-ocean-wave-end/10',
    },
    {
      icon: Video,
      title: 'Подбирать видео',
      description: 'Персонализированные курсы от врачей',
      gradient: 'from-warm-accent/30 to-warm-accent/10',
    },
    {
      icon: ClipboardList,
      title: 'Создавать чек-листы',
      description: 'Практические списки для вашей ситуации',
      gradient: 'from-primary-purple/30 to-ocean-wave-start/10',
    },
    {
      icon: Bell,
      title: 'Напоминать о здоровье',
      description: 'О приёме добавок, визитах к врачу, анализах',
      gradient: 'from-ocean-wave-start/30 to-warm-accent/10',
    },
    {
      icon: Heart,
      title: 'Вести дневник симптомов',
      description: 'Отслеживайте изменения и делитесь с врачом',
      gradient: 'from-warm-accent/30 to-primary-purple/10',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2
          className="text-h2 font-bold text-deep-navy text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Что умеет Ева?
        </motion.h2>
        
        <motion.p
          className="text-body-large text-deep-navy/70 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Полный набор инструментов для поддержки в период менопаузы
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isInDevelopment = feature.title === 'Напоминать о здоровье' || feature.title === 'Вести дневник симптомов'
            
            return (
              <motion.div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg flex flex-col relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* "В разработке" badge */}
                {isInDevelopment && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-accent/20 text-warm-accent text-xs font-semibold rounded-full border border-warm-accent/30">
                      <span className="w-1.5 h-1.5 bg-warm-accent rounded-full animate-pulse" />
                      В разработке
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-primary-purple" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-h5 font-semibold text-deep-navy mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-body text-deep-navy/70 mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Voting buttons for reminder feature */}
                  {feature.title === 'Напоминать о здоровье' && (
                    <div className="mt-4 pt-4 border-t border-lavender-bg">
                      <p className="text-xs text-deep-navy/60 mb-3">Нужна ли вам эта функция?</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={async () => {
                            const newVote = reminderVote === 'up' ? null : 'up'
                            setReminderVote(newVote)
                            
                            if (newVote) {
                              setIsSubmitting(true)
                              setVoteMessage(null)
                              
                              try {
                                const response = await fetch('/api/features/vote', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    featureName: 'reminder_health',
                                    voteType: newVote,
                                  }),
                                })
                                
                                const data = await response.json()
                                
                                if (response.ok) {
                                  setVoteMessage('Спасибо за ваш голос! Мы учтём это при разработке.')
                                } else {
                                  setVoteMessage('Ошибка при сохранении голоса. Попробуйте ещё раз.')
                                  setReminderVote(reminderVote) // Revert
                                }
                              } catch (error) {
                                console.error('Error submitting vote:', error)
                                setVoteMessage('Ошибка при сохранении голоса. Попробуйте ещё раз.')
                                setReminderVote(reminderVote) // Revert
                              } finally {
                                setIsSubmitting(false)
                              }
                            } else {
                              setVoteMessage(null)
                            }
                          }}
                          disabled={isSubmitting}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            reminderVote === 'up'
                              ? 'bg-primary-purple/10 text-primary-purple border-2 border-primary-purple/30'
                              : 'bg-lavender-bg text-deep-navy/70 hover:bg-primary-purple/5 border-2 border-transparent'
                          }`}
                          aria-label="Голосовать за"
                        >
                          <ThumbsUp className={`w-4 h-4 ${reminderVote === 'up' ? 'fill-primary-purple' : ''}`} />
                          <span>Да</span>
                        </button>
                        <button
                          onClick={async () => {
                            const newVote = reminderVote === 'down' ? null : 'down'
                            setReminderVote(newVote)
                            
                            if (newVote) {
                              setIsSubmitting(true)
                              setVoteMessage(null)
                              
                              try {
                                const response = await fetch('/api/features/vote', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    featureName: 'reminder_health',
                                    voteType: newVote,
                                  }),
                                })
                                
                                const data = await response.json()
                                
                                if (response.ok) {
                                  setVoteMessage('Понятно, спасибо за обратную связь!')
                                } else {
                                  setVoteMessage('Ошибка при сохранении голоса. Попробуйте ещё раз.')
                                  setReminderVote(reminderVote) // Revert
                                }
                              } catch (error) {
                                console.error('Error submitting vote:', error)
                                setVoteMessage('Ошибка при сохранении голоса. Попробуйте ещё раз.')
                                setReminderVote(reminderVote) // Revert
                              } finally {
                                setIsSubmitting(false)
                              }
                            } else {
                              setVoteMessage(null)
                            }
                          }}
                          disabled={isSubmitting}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            reminderVote === 'down'
                              ? 'bg-deep-navy/10 text-deep-navy border-2 border-deep-navy/30'
                              : 'bg-lavender-bg text-deep-navy/70 hover:bg-deep-navy/5 border-2 border-transparent'
                          }`}
                          aria-label="Голосовать против"
                        >
                          <ThumbsDown className={`w-4 h-4 ${reminderVote === 'down' ? 'fill-deep-navy' : ''}`} />
                          <span>Нет</span>
                        </button>
                      </div>
                      {voteMessage && (
                        <p className="text-xs text-deep-navy/50 mt-2">
                          {voteMessage}
                        </p>
                      )}
                      {isSubmitting && (
                        <p className="text-xs text-deep-navy/40 mt-2">
                          Сохранение...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}






