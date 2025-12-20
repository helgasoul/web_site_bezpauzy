'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2 } from 'lucide-react'

interface DownloadQuizPDFButtonProps {
  quizType: 'inflammation' | 'mrs'
  quizData: any
  label?: string
}

export const DownloadQuizPDFButton: FC<DownloadQuizPDFButtonProps> = ({
  quizType,
  quizData,
  label = 'Скачать результаты (PDF)',
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const endpoint = quizType === 'inflammation' 
        ? '/api/quiz/inflammation/pdf'
        : '/api/quiz/mrs/pdf'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      })

      if (!response.ok) {
        throw new Error('Ошибка при генерации PDF')
      }

      // Создаем blob и скачиваем
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quizType}-quiz-results-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Не удалось скачать PDF. Попробуйте позже.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.button
      onClick={handleDownload}
      disabled={isDownloading}
      whileHover={{ scale: isDownloading ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Генерация PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span>{label}</span>
        </>
      )}
    </motion.button>
  )
}

