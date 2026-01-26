'use client'

import { FC, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Download, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

interface DownloadGuidePageClientProps {
  token: string
}

export const DownloadGuidePageClient: FC<DownloadGuidePageClientProps> = ({ token }) => {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resources/download/${token}`)

      if (!response.ok) {
        // Если ответ не OK, пытаемся получить JSON с ошибкой
        let errorMessage = 'Ошибка при скачивании'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Если не JSON, используем статус текст
          errorMessage = `${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // API возвращает файл (binary), а не JSON
      const blob = await response.blob()
      
      // Получаем имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'guide.epub'
      
      if (contentDisposition) {
        // Пытаемся извлечь имя файла из заголовка
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
          // Декодируем UTF-8 имя файла, если оно закодировано
          if (filename.includes('%')) {
            filename = decodeURIComponent(filename)
          }
        }
      }

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // Очищаем
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setSuccess(true)
    } catch (err: any) {
      console.error('❌ [DownloadGuidePageClient] Ошибка скачивания:', err)
      setError(err.message || 'Произошла ошибка при скачивании')
    } finally {
      setDownloading(false)
    }
  }, [token])

  useEffect(() => {
    // Автоматически начинаем скачивание при загрузке страницы
    handleDownload()
  }, [handleDownload])

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {downloading && !error && !success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-12 text-center"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary-purple mx-auto mb-4" />
              <h1 className="text-h2 font-bold text-deep-navy mb-4">
                Подготовка файла...
              </h1>
              <p className="text-body text-deep-navy/70">
                Генерируем персонализированный EPUB файл
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-12 text-center"
            >
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-h2 font-bold text-deep-navy mb-4">Ошибка</h1>
              <p className="text-body text-deep-navy/70 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Попробовать снова
                </button>
                <div>
                  <Link
                    href="/resources/guides"
                    className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start font-medium"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Вернуться к гайдам
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-h2 font-bold text-deep-navy mb-4">
                Файл готов к скачиванию
              </h1>
              <p className="text-body text-deep-navy/70 mb-6">
                EPUB файл будет доступен после реализации watermarking
              </p>
              <Link
                href="/resources/guides"
                className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Вернуться к гайдам
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}

