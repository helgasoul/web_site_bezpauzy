'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, FileText, FileQuestion, ListChecks, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SavedContentItem {
  id: string
  content_type: 'article' | 'quiz' | 'checklist'
  content_id: string
  title: string
  description: string | null
  url: string
  metadata: Record<string, any> | null
  saved_at: string
}

interface SavedContentProps {}

export const SavedContent: FC<SavedContentProps> = () => {
  const [content, setContent] = useState<SavedContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSavedContent()
  }, [])

  const fetchSavedContent = async () => {
    try {
      const response = await fetch('/api/account/saved-content', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить сохраненный контент')
      }
      
      const data = await response.json()
      setContent(data.saved_content || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/account/saved-content?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Не удалось удалить')
      }

      setContent(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Error deleting content:', err)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article':
        return FileText
      case 'quiz':
        return FileQuestion
      case 'checklist':
        return ListChecks
      default:
        return Bookmark
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return 'Статья'
      case 'quiz':
        return 'Квиз'
      case 'checklist':
        return 'Чек-лист'
      default:
        return 'Контент'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-purple animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
        <p className="text-body text-red-700">{error}</p>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="bg-lavender-bg rounded-2xl p-8 text-center">
        <Bookmark className="w-12 h-12 text-primary-purple/30 mx-auto mb-4" />
        <h3 className="text-h5 font-semibold text-deep-navy mb-2">
          Пока нет сохраненного контента
        </h3>
        <p className="text-body text-deep-navy/70 mb-6">
          Сохраняйте интересные статьи, квизы и чек-листы, чтобы вернуться к ним позже
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white rounded-xl font-medium hover:bg-primary-purple/90 transition-colors"
          >
            <FileText size={18} />
            <span>Перейти к статьям</span>
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-wave-start text-white rounded-xl font-medium hover:bg-ocean-wave-start/90 transition-colors"
          >
            <FileQuestion size={18} />
            <span>Перейти к квизам</span>
          </Link>
          <Link
            href="/resources/checklists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-warm-accent text-white rounded-xl font-medium hover:bg-warm-accent/90 transition-colors"
          >
            <ListChecks size={18} />
            <span>Перейти к чек-листам</span>
          </Link>
        </div>
      </div>
    )
  }

  // Группируем контент по типам
  const contentByType = {
    article: content.filter(item => item.content_type === 'article'),
    quiz: content.filter(item => item.content_type === 'quiz'),
    checklist: content.filter(item => item.content_type === 'checklist'),
  }

  return (
    <div className="space-y-8">
      {/* Статьи */}
      {contentByType.article.length > 0 && (
        <div>
          <h3 className="text-h4 font-bold text-deep-navy mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-purple" />
            <span>Статьи ({contentByType.article.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentByType.article.map((item, index) => {
              const Icon = getContentIcon(item.content_type)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary-purple" />
                        <span className="text-xs font-medium text-primary-purple">
                          {getContentTypeLabel(item.content_type)}
                        </span>
                      </div>
                      <h4 className="text-h6 font-bold text-deep-navy mb-2 line-clamp-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-body-small text-deep-navy/70 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-shrink-0 p-2 text-deep-navy/50 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Удалить из подборки"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link
                    href={item.url}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-purple hover:text-ocean-wave-start transition-colors"
                  >
                    <span>Читать</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Квизы */}
      {contentByType.quiz.length > 0 && (
        <div>
          <h3 className="text-h4 font-bold text-deep-navy mb-4 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-ocean-wave-start" />
            <span>Квизы ({contentByType.quiz.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentByType.quiz.map((item, index) => {
              const Icon = getContentIcon(item.content_type)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 border-2 border-lavender-bg hover:border-ocean-wave-start/30 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-ocean-wave-start" />
                        <span className="text-xs font-medium text-ocean-wave-start">
                          {getContentTypeLabel(item.content_type)}
                        </span>
                      </div>
                      <h4 className="text-h6 font-bold text-deep-navy mb-2 line-clamp-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-body-small text-deep-navy/70 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-shrink-0 p-2 text-deep-navy/50 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Удалить из подборки"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link
                    href={item.url}
                    className="inline-flex items-center gap-2 text-sm font-medium text-ocean-wave-start hover:text-primary-purple transition-colors"
                  >
                    <span>Пройти квиз</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Чек-листы */}
      {contentByType.checklist.length > 0 && (
        <div>
          <h3 className="text-h4 font-bold text-deep-navy mb-4 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-warm-accent" />
            <span>Чек-листы ({contentByType.checklist.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentByType.checklist.map((item, index) => {
              const Icon = getContentIcon(item.content_type)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 border-2 border-lavender-bg hover:border-warm-accent/30 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-warm-accent" />
                        <span className="text-xs font-medium text-warm-accent">
                          {getContentTypeLabel(item.content_type)}
                        </span>
                      </div>
                      <h4 className="text-h6 font-bold text-deep-navy mb-2 line-clamp-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-body-small text-deep-navy/70 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-shrink-0 p-2 text-deep-navy/50 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Удалить из подборки"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link
                    href={item.url}
                    className="inline-flex items-center gap-2 text-sm font-medium text-warm-accent hover:text-primary-purple transition-colors"
                  >
                    <span>Открыть</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

