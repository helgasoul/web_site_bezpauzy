'use client'

import { FC } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Sparkles } from 'lucide-react'

interface AskEvaQuizButtonProps {
  quizType: 'inflammation' | 'mrs'
  quizResult?: {
    level?: string
    score?: number
  }
}

export const AskEvaQuizButton: FC<AskEvaQuizButtonProps> = ({ quizType, quizResult }) => {
  // Build chat link with quiz context
  const chatLink = `/chat?quiz=${quizType}${quizResult?.level ? `&level=${quizResult.level}` : ''}${quizResult?.score ? `&score=${quizResult.score}` : ''}`

  const getQuizTitle = () => {
    if (quizType === 'inflammation') {
      return 'Индекс воспаления'
    }
    return 'Шкала MRS'
  }

  const getQuizDescription = () => {
    if (quizType === 'inflammation') {
      return 'Спросите Еву о результатах вашего квиза "Индекс воспаления" — она поможет составить персональный план по снижению воспаления и улучшению питания.'
    }
    return 'Спросите Еву о результатах вашего квиза "Шкала MRS" — она объяснит ваши симптомы и поможет подобрать подходящие методы облегчения.'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-8"
    >
      <div className="bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-purple" />
              <h3 className="text-h4 font-bold text-deep-navy">Остались вопросы?</h3>
            </div>
          </div>

          <p className="text-body text-deep-navy/80 mb-6 leading-relaxed">
            {getQuizDescription()}
          </p>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-primary-purple rounded-full" />
              <span>Персональные рекомендации на основе ваших результатов</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-primary-purple rounded-full" />
              <span>Ответы на основе научных источников</span>
            </div>
          </div>

          <Link href={chatLink}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Спросить Еву</span>
            </motion.div>
          </Link>

          <p className="text-caption text-deep-navy/60 text-center mt-4">
            Откроется чат на сайте
          </p>
        </div>
      </div>
    </motion.div>
  )
}

