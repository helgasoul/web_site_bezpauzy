'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, ClipboardList } from 'lucide-react'

export const MRSQuizPreview: FC = () => {
  const router = useRouter()

  const handleStartQuiz = () => {
    router.push('/quiz')
  }

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <motion.button
            onClick={handleStartQuiz}
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-6 rounded-2xl text-h3 font-bold hover:shadow-strong hover:scale-[1.02] transition-all duration-300 mb-6"
          >
            <ClipboardList className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span>Оцените свои симптомы менопаузы</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
          <p className="text-body-large text-deep-navy/70 max-w-2xl mx-auto">
            Этот опросник основан на Menopause Rating Scale (MRS) и поможет вам оценить выраженность симптомов менопаузы. Быстро, конфиденциально и создано специально для вас.
          </p>
          <p className="text-body-small text-deep-navy/60 mt-4 max-w-2xl mx-auto">
            Опросник адаптирован на основе шкалы Greene, которая широко используется для выявления потребности в лечении во время менопаузального перехода.
          </p>
        </div>
      </div>
    </div>
  )
}

