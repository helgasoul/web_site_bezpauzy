'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2, FileText } from 'lucide-react'

interface DownloadGuideButtonProps {
  guideType?: 'anti-inflammatory-nutrition'
  label?: string
}

export const DownloadGuideButton: FC<DownloadGuideButtonProps> = ({
  guideType = 'anti-inflammatory-nutrition',
  label = 'Скачать PDF-гайд',
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/guides/anti-inflammatory-nutrition', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке гайда')
      }

      // Создаем blob и скачиваем
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Противовоспалительное питание.docx'
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

