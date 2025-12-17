'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AskEvaWidgetProps {
  articleTitle?: string
  articleSlug?: string
}

export const AskEvaWidget: FC<AskEvaWidgetProps> = ({ articleTitle, articleSlug }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Show widget after user scrolls down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const botLink = articleSlug
    ? `https://t.me/bezpauzy_bot?start=website_article_${articleSlug}`
    : 'https://t.me/bezpauzy_bot'

  return (
    <>
      {/* Floating Button - triggers the widget */}
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.div
            className="fixed right-6 bottom-6 z-50"
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative w-16 h-16 bg-gradient-primary rounded-full shadow-strong flex items-center justify-center hover:scale-110 transition-transform duration-300"
              aria-label="Спросить Еву"
            >
              <MessageCircle className="w-8 h-8 text-white" />
              
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-primary-purple animate-ping opacity-20" />
              
              {/* Tooltip on hover */}
              <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-deep-navy text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                  Спросить Еву
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-deep-navy" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Widget */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 md:p-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-h5 font-semibold text-deep-navy">Ева</h3>
                      <p className="text-caption text-deep-navy/60">Онлайн</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-lavender-bg rounded-full transition-colors"
                    aria-label="Закрыть"
                  >
                    <X className="w-5 h-5 text-deep-navy" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full">
                      <Sparkles className="w-4 h-4 text-primary-purple" />
                      <span className="text-sm font-medium text-primary-purple">AI-консультант</span>
                    </div>

                    <h4 className="text-h4 font-semibold text-deep-navy">
                      Остались вопросы?
                    </h4>

                    <p className="text-body text-deep-navy/70">
                      {articleTitle
                        ? `Спросите Еву о "${articleTitle}" — она ответит с учётом вашей ситуации.`
                        : 'Спросите Еву в ассистенте — она ответит на основе научных источников и вашей истории.'}
                    </p>

                    <div className="bg-lavender-bg rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-deep-navy/70">
                        <span className="w-2 h-2 bg-primary-purple rounded-full" />
                        <span>10 бесплатных вопросов в день</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-deep-navy/70">
                        <span className="w-2 h-2 bg-primary-purple rounded-full" />
                        <span>Ответы на основе науки</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-deep-navy/70">
                        <span className="w-2 h-2 bg-primary-purple rounded-full" />
                        <span>Конфиденциально и безопасно</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={botLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-full bg-gradient-primary text-white px-6 py-4 rounded-full text-center font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300">
                      Спросить Еву →
                    </div>
                  </Link>

                  {/* Small text */}
                  <p className="text-caption text-deep-navy/60 text-center">
                    Откроется в Telegram
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-lavender-bg">
                  <p className="text-caption text-deep-navy/60 text-center">
                    Ева доступна 24/7
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

