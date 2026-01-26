'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2, FileText } from 'lucide-react'

interface DownloadGuideButtonProps {
  guideId?: string
  guideType?: 'anti-inflammatory-nutrition' // Для обратной совместимости
  label?: string
  filename?: string
}

// Маппинг ID гайдов на имена файлов и отображаемые имена
const guideFiles: Record<string, { filename: string, displayName: string }> = {
  'anti-inflammatory-nutrition': {
    filename: 'anti-inflammatory-nutrition.pdf',
    displayName: 'Гайд по противовоспалительному питанию.pdf'
  },
  'sleep-improvement': {
    filename: 'Гайд_по_улучшению_сна_в_менопаузе.pdf',
    displayName: 'Гайд по улучшению сна в менопаузе.pdf'
  },
  'hot-flashes-management': {
    filename: 'Гайд_по_управлению_приливами.pdf',
    displayName: 'Гайд по управлению приливами.pdf'
  },
  'bone-health': {
    filename: 'Гайд_по_здоровью_костей_в_менопаузе.pdf',
    displayName: 'Гайд по здоровью костей в менопаузе.pdf'
  },
}

export const DownloadGuideButton: FC<DownloadGuideButtonProps> = ({
  guideId,
  guideType,
  label = 'Скачать PDF-гайд',
  filename,
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Определяем, какой файл нужно скачать
      const effectiveGuideId = guideId || guideType || 'anti-inflammatory-nutrition'
      const guideFile = guideFiles[effectiveGuideId]
      
      if (!guideFile) {
        throw new Error('Гайд не найден')
      }

      // Используем API endpoint для правильной обработки имени файла
      const endpoint = `/api/guides/${effectiveGuideId}`

      const response = await fetch(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке гайда')
      }

      // Получаем имя файла из заголовка Content-Disposition или используем переданное
      const contentDisposition = response.headers.get('Content-Disposition')
      let downloadFilename = filename || guideFile.displayName
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          downloadFilename = filenameMatch[1]
        }
      }

      // Создаем blob и скачиваем
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadFilename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading guide:', error)
      alert('Не удалось скачать гайд. Попробуйте позже.')
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
          <span>Загрузка...</span>
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" />
          <span>{label}</span>
        </>
      )}
    </motion.button>
  )
}

