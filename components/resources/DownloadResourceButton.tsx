'use client'

import { FC, useState } from 'react'
import { Download, Loader2, FileText, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Resource } from '@/lib/supabase/resources'

interface DownloadResourceButtonProps {
  resource: Resource
  label?: string
  onDownloadComplete?: () => void
  variant?: 'default' | 'small' | 'link'
}

export const DownloadResourceButton: FC<DownloadResourceButtonProps> = ({
  resource,
  label,
  onDownloadComplete,
  variant = 'default',
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const getDownloadUrl = async (): Promise<string> => {
    // Для бесплатных гайдов используем прямой endpoint
    if (!resource.isPaid) {
      return `/api/resources/${resource.slug}/download`
    }

    // Для платных гайдов нужен токен - проверяем статус покупки
    // Это должно быть обработано в родительском компоненте,
    // но на всякий случай возвращаем endpoint для платных
    return `/api/resources/${resource.slug}/purchase-status`
  }

  const getFilename = (): string => {
    // Определяем расширение файла
    const isEPUB = resource.epubFilePath || resource.pdfFilePath?.endsWith('.epub')
    const extension = isEPUB ? '.epub' : '.pdf'
    return resource.pdfFilename || `${resource.title}${extension}`
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Для бесплатных гайдов - прямое скачивание
      if (!resource.isPaid) {
        const downloadUrl = await getDownloadUrl()
        
        const response = await fetch(downloadUrl, {
          method: 'GET',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Ошибка при загрузке файла')
        }

        // Создаем blob и скачиваем
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Получаем имя файла из заголовка Content-Disposition или используем дефолтное
        const contentDisposition = response.headers.get('Content-Disposition')
        let downloadFilename = getFilename()
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)/)
          if (filenameMatch) {
            // Декодируем UTF-8 имя файла
            try {
              downloadFilename = decodeURIComponent(filenameMatch[1].replace(/^UTF-8''/, ''))
            } catch {
              downloadFilename = filenameMatch[1]
            }
          }
        }
        
        a.download = downloadFilename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Инкрементируем счетчик скачиваний (опционально, через API)
        try {
          await fetch(`/api/resources/${resource.slug}/increment-download`, {
            method: 'POST',
          })
        } catch (error) {
          // Не критично, если не удалось обновить счетчик
          console.warn('Failed to increment download count:', error)
        }

        onDownloadComplete?.()
        return
      }

      // Для платных гайдов - нужна покупка и токен
      // Это должно обрабатываться в родительском компоненте
      alert('Этот гайд платный. Пожалуйста, приобретите его для скачивания.')
    } catch (error: any) {
      console.error('Error downloading resource:', error)
      alert(error.message || 'Не удалось скачать файл. Попробуйте позже.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Определяем стили в зависимости от варианта
  const getButtonStyles = () => {
    switch (variant) {
      case 'small':
        return 'w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
      case 'link':
        return 'flex items-center gap-2 text-primary-purple hover:gap-3 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      default:
        return 'w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-full font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'
    }
  }

  const getIconSize = () => variant === 'link' ? 'w-4 h-4' : 'w-5 h-5'

  if (variant === 'link') {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={getButtonStyles()}
      >
        {isDownloading ? (
          <>
            <Loader2 className={getIconSize() + ' animate-spin'} />
            <span className="text-body-small font-medium">Загрузка...</span>
          </>
        ) : (
          <>
            <Download className={getIconSize()} />
            <span className="text-body-small font-medium">{label || 'Скачать бесплатно'}</span>
            <ArrowRight className={getIconSize()} />
          </>
        )}
      </button>
    )
  }

  return (
    <motion.button
      onClick={handleDownload}
      disabled={isDownloading}
      whileHover={{ scale: isDownloading ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={getButtonStyles()}
    >
      {isDownloading ? (
        <>
          <Loader2 className={getIconSize() + ' animate-spin'} />
          <span>{variant === 'small' ? 'Загрузка...' : 'Загрузка...'}</span>
        </>
      ) : (
        <>
          <FileText className={getIconSize()} />
          <span>{label || 'Скачать PDF'}</span>
        </>
      )}
    </motion.button>
  )
}

