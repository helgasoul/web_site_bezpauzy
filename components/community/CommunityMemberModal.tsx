'use client'

import { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, MessageCircle, BookOpen, Video, Users, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const TELEGRAM_COMMUNITY_LINK = process.env.NEXT_PUBLIC_TELEGRAM_COMMUNITY_LINK || 'https://t.me/bezpauzy_community'

interface CommunityMemberModalProps {
  isOpen: boolean
  onClose: () => void
  memberName?: string
}

export const CommunityMemberModal: FC<CommunityMemberModalProps> = ({
  isOpen,
  onClose,
  memberName,
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-12">
            {/* Success Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-h2 font-bold text-deep-navy mb-4">
                {memberName ? `Добро пожаловать, ${memberName}!` : 'Вы уже в сообществе!'}
              </h2>
              <p className="text-body text-deep-navy/70">
                У вас есть доступ ко всем возможностям сообщества «Без паузы»
              </p>
            </div>

            {/* Available Resources */}
            <div className="space-y-4 mb-8">
              <h3 className="text-h4 font-semibold text-deep-navy mb-4">
                Что вам доступно:
              </h3>

              {/* Resource Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telegram Group */}
                <Link
                  href={TELEGRAM_COMMUNITY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-card border border-primary-purple/10 hover:border-primary-purple/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-purple/10 rounded-full flex items-center justify-center group-hover:bg-primary-purple/20 transition-colors">
                      <MessageCircle className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-h5 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors">
                        Telegram-группа
                      </h4>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Общайтесь с другими участницами, задавайте вопросы и получайте поддержку
                      </p>
                      <div className="flex items-center gap-2 text-primary-purple text-sm font-medium">
                        <span>Перейти в группу</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Articles Library */}
                <Link
                  href="/blog"
                  className="group p-6 bg-gradient-to-br from-warm-accent/5 to-primary-purple/5 rounded-card border border-warm-accent/10 hover:border-warm-accent/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-warm-accent/10 rounded-full flex items-center justify-center group-hover:bg-warm-accent/20 transition-colors">
                      <BookOpen className="w-6 h-6 text-warm-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-h5 font-semibold text-deep-navy mb-2 group-hover:text-warm-accent transition-colors">
                        Библиотека статей
                      </h4>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Научно обоснованные статьи от экспертов о менопаузе
                      </p>
                      <div className="flex items-center gap-2 text-warm-accent text-sm font-medium">
                        <span>Читать статьи</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Webinars */}
                <Link
                  href="/blog?category=webinar"
                  className="group p-6 bg-gradient-to-br from-ocean-wave-start/5 to-primary-purple/5 rounded-card border border-ocean-wave-start/10 hover:border-ocean-wave-start/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-ocean-wave-start/10 rounded-full flex items-center justify-center group-hover:bg-ocean-wave-start/20 transition-colors">
                      <Video className="w-6 h-6 text-ocean-wave-start" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-h5 font-semibold text-deep-navy mb-2 group-hover:text-ocean-wave-start transition-colors">
                        Вебинары и записи
                      </h4>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Смотрите записи вебинаров с экспертами и участвуйте в новых
                      </p>
                      <div className="flex items-center gap-2 text-ocean-wave-start text-sm font-medium">
                        <span>Смотреть вебинары</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* AI Assistant */}
                <Link
                  href="/chat"
                  className="group p-6 bg-gradient-to-br from-primary-purple/5 to-warm-accent/5 rounded-card border border-primary-purple/10 hover:border-primary-purple/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-purple/10 rounded-full flex items-center justify-center group-hover:bg-primary-purple/20 transition-colors">
                      <Sparkles className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-h5 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors">
                        Ассистент Ева
                      </h4>
                      <p className="text-body-small text-deep-navy/70 mb-3">
                        Задавайте вопросы AI-консультанту 24/7 и получайте научно обоснованные ответы
                      </p>
                      <div className="flex items-center gap-2 text-primary-purple text-sm font-medium">
                        <span>Начать диалог</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-lavender-bg rounded-card p-6 mb-6">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-h5 font-semibold text-deep-navy mb-2">
                    Остались вопросы?
                  </h4>
                  <p className="text-body-small text-deep-navy/70">
                    Напишите нам в Telegram-группе или через форму обратной связи. Мы всегда рады помочь!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/community/dashboard"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-strong hover:scale-[1.02] transition-all duration-300"
              >
                <span>Перейти в личный кабинет</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={onClose}
                className="px-6 py-4 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
              >
                Закрыть
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

