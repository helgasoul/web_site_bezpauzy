'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2 } from 'lucide-react'

interface DownloadQuizPDFButtonProps {
  quizType: 'inflammation' | 'mrs' | 'phenoage' | 'frax' | 'whr'
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
        : quizType === 'mrs'
        ? '/api/quiz/mrs/pdf'
        : quizType === 'frax'
        ? '/api/quiz/frax/pdf'
        : quizType === 'whr'
        ? '/api/quiz/whr/pdf'
        : '/api/quiz/phenoage/pdf'

      console.log('[DownloadQuizPDFButton] Sending request to:', endpoint)
      console.log('[DownloadQuizPDFButton] Quiz data:', quizData)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      })

      console.log('[DownloadQuizPDFButton] Response status:', response.status, response.statusText)
      console.log('[DownloadQuizPDFButton] Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      })

      if (!response.ok) {
        // Пытаемся получить детали ошибки
        let errorMessage = 'Не удалось сгенерировать PDF'
        let errorDetails = ''
        
        try {
          // Проверяем, это JSON или PDF
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
            errorDetails = errorData.details || ''
            console.error('[DownloadQuizPDFButton] API error details:', errorData)
          } else {
            // Если не JSON, читаем как текст
            const errorText = await response.text()
            console.error('[DownloadQuizPDFButton] API error text:', errorText)
            errorMessage = errorText || errorMessage
          }
        } catch (e) {
          console.error('[DownloadQuizPDFButton] Could not parse error response:', e)
        }
        
        throw new Error(errorMessage + (errorDetails ? `: ${errorDetails}` : ''))
      }

      // Проверяем, что это действительно PDF
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/pdf')) {
        console.warn('[DownloadQuizPDFButton] Unexpected content type:', contentType)
        // Пытаемся прочитать как JSON для ошибки
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || errorData.message || 'Неверный формат ответа от сервера')
        } catch (e) {
          throw new Error('Сервер вернул не PDF файл')
        }
      }

      // Создаем blob и скачиваем
      const blob = await response.blob()
      console.log('[DownloadQuizPDFButton] PDF blob received, size:', blob.size, 'bytes')

      if (blob.size === 0) {
        throw new Error('Получен пустой PDF файл')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quizType}-quiz-results-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('[DownloadQuizPDFButton] PDF downloaded successfully')
    } catch (error) {
      console.error('[DownloadQuizPDFButton] Error downloading PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      alert(`Не удалось скачать PDF: ${errorMessage}. Попробуйте позже или обратитесь в поддержку.`)
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

