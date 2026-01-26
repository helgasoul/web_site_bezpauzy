'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle, Send, User, Clock, Eye, MessageCircle, Pin, Lock, Edit2, Save, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface Topic {
  id: string
  category_id: string
  author_email: string
  author_name: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  views_count: number
  replies_count: number
  last_reply_at: string | null
  created_at: string
}

interface Reply {
  id: string
  topic_id: string
  author_email: string
  author_name: string
  content: string
  created_at: string
  updated_at?: string
}

interface TopicDetailModalProps {
  topic: Topic
  isOpen: boolean
  onClose: () => void
  onReplyAdded: () => void
  userEmail: string | null
}

const replySchema = z.object({
  content: z.string().min(5, 'Ответ должен содержать минимум 5 символов').max(3000, 'Ответ слишком длинный'),
})

type ReplyFormData = z.infer<typeof replySchema>

export const TopicDetailModal: FC<TopicDetailModalProps> = ({
  topic,
  isOpen,
  onClose,
  onReplyAdded,
  userEmail,
}) => {
  const [replies, setReplies] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: '',
    },
  })

  const loadReplies = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/forum/topics/${topic.id}/replies`)
      const result = await response.json()
      if (result.replies) {
        setReplies(result.replies)
      }
    } catch (error) {
      console.error('Error loading replies:', error)
    } finally {
      setIsLoading(false)
    }
  }, [topic.id])

  useEffect(() => {
    if (isOpen) {
      loadReplies()
    }
  }, [isOpen, topic.id, loadReplies])

  const onSubmit = async (data: ReplyFormData) => {
    if (!userEmail) {
      setErrorMessage('Необходимо войти в сообщество для ответа')
      return
    }

    if (topic.is_locked) {
      setErrorMessage('Эта тема заблокирована для новых ответов')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const userName = localStorage.getItem('bezpauzy_community_name') || userEmail.split('@')[0]

      const response = await fetch(`/api/forum/topics/${topic.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          author_email: userEmail,
          author_name: userName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Произошла ошибка при отправке ответа')
      }

      reset()
      loadReplies()
      onReplyAdded()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при отправке ответа')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days < 7) return `${days} дн назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }

  const isReplyEdited = (reply: Reply) => {
    if (!reply.updated_at) return false
    return new Date(reply.updated_at).getTime() > new Date(reply.created_at).getTime() + 1000 // +1 секунда для учета округления
  }

  const handleStartEdit = (reply: Reply) => {
    if (reply.author_email.toLowerCase() !== userEmail?.toLowerCase()) {
      setErrorMessage('Вы можете редактировать только свои комментарии')
      return
    }
    setEditingReplyId(reply.id)
    setEditContent(reply.content)
    setErrorMessage('')
  }

  const handleCancelEdit = () => {
    setEditingReplyId(null)
    setEditContent('')
    setErrorMessage('')
  }

  const handleSaveEdit = async (replyId: string) => {
    if (!userEmail) {
      setErrorMessage('Необходимо войти в сообщество')
      return
    }

    const trimmedContent = editContent.trim()
    if (trimmedContent.length < 5) {
      setErrorMessage('Комментарий должен содержать минимум 5 символов')
      return
    }

    if (trimmedContent.length > 3000) {
      setErrorMessage('Комментарий слишком длинный (максимум 3000 символов)')
      return
    }

    setIsUpdating(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/forum/topics/${topic.id}/replies?replyId=${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedContent,
          author_email: userEmail,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || 'Произошла ошибка при обновлении комментария'
        setErrorMessage(errorMsg)
        return
      }

      // Обновляем список комментариев
      setReplies(prevReplies =>
        prevReplies.map(reply =>
          reply.id === replyId ? result.reply : reply
        )
      )

      setEditingReplyId(null)
      setEditContent('')
      setErrorMessage('')
    } catch (error) {
      console.error('Error updating reply:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при обновлении комментария')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-12">
            {/* Topic Header */}
            <div className="mb-6 pb-6 border-b border-lavender-bg">
              <div className="flex items-center gap-2 mb-4">
                {topic.is_pinned && (
                  <Pin className="w-5 h-5 text-primary-purple" />
                )}
                {topic.is_locked && (
                  <Lock className="w-5 h-5 text-deep-navy/40" />
                )}
                <h2 className="text-h2 font-bold text-deep-navy">
                  {topic.title}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-body-small text-deep-navy/60">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{topic.author_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(topic.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{topic.views_count} просмотров</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  <span>{topic.replies_count} ответов</span>
                </div>
              </div>
            </div>

            {/* Topic Content */}
            <div className="mb-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-body text-deep-navy/80 whitespace-pre-wrap leading-relaxed">
                  {topic.content}
                </p>
              </div>
            </div>

            {/* Replies Section */}
            <div className="mb-8">
              <h3 className="text-h4 font-semibold text-deep-navy mb-4">
                Ответы ({replies.length})
              </h3>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-purple"></div>
                </div>
              ) : replies.length === 0 ? (
                <div className="bg-lavender-bg rounded-card p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-deep-navy/20 mx-auto mb-4" />
                  <p className="text-body text-deep-navy/70">
                    Пока нет ответов. Станьте первым, кто ответит!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {replies.map((reply) => {
                    const isEditing = editingReplyId === reply.id
                    const isAuthor = reply.author_email.toLowerCase() === userEmail?.toLowerCase()
                    const isEdited = isReplyEdited(reply)

                    return (
                      <div
                        key={reply.id}
                        className="bg-lavender-bg rounded-card p-6 border-l-4 border-primary-purple"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center text-white font-semibold">
                            {reply.author_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-semibold text-deep-navy">{reply.author_name}</span>
                                <span className="text-body-small text-deep-navy/60">
                                  {formatDate(reply.created_at)}
                                </span>
                                {isEdited && (
                                  <span className="text-body-small text-deep-navy/50 italic">
                                    (отредактировано {formatDateShort(reply.updated_at!)})
                                  </span>
                                )}
                              </div>
                              {isAuthor && !isEditing && (
                                <button
                                  onClick={() => handleStartEdit(reply)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-body-small text-primary-purple hover:bg-primary-purple/10 rounded-lg transition-colors"
                                  title="Редактировать комментарий"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span>Редактировать</span>
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-3">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => {
                                    setEditContent(e.target.value)
                                    // Очищаем ошибку при изменении текста
                                    if (errorMessage && editingReplyId === reply.id) {
                                      setErrorMessage('')
                                    }
                                  }}
                                  rows={4}
                                  className="w-full px-4 py-3 rounded-card border border-primary-purple focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy resize-none"
                                  placeholder="Редактируйте ваш комментарий..."
                                  disabled={isUpdating}
                                />
                                {errorMessage && editingReplyId === reply.id && (
                                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{errorMessage}</p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveEdit(reply.id)}
                                    disabled={isUpdating || editContent.trim().length < 5 || editContent.trim().length > 3000}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg text-sm font-medium hover:bg-primary-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isUpdating ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Сохранение...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4" />
                                        <span>Сохранить</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleCancelEdit()
                                      setErrorMessage('')
                                    }}
                                    disabled={isUpdating}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-lavender-bg text-deep-navy rounded-lg text-sm font-medium hover:bg-lavender-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Отмена</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-body text-deep-navy/80 whitespace-pre-wrap leading-relaxed">
                                {reply.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Reply Form */}
            {userEmail && !topic.is_locked && (
              <div className="border-t border-lavender-bg pt-6">
                <h3 className="text-h5 font-semibold text-deep-navy mb-4">
                  Добавить ответ
                </h3>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-50 border border-red-200 rounded-card flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-body text-red-800">{errorMessage}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <textarea
                    {...register('content')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy resize-none"
                    placeholder="Напишите ваш ответ..."
                    disabled={isSubmitting}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600">{errors.content.message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Отправить ответ</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {!userEmail && (
              <div className="bg-lavender-bg rounded-card p-6 text-center border-t border-lavender-bg">
                <p className="text-body text-deep-navy/70 mb-4">
                  Войдите в сообщество, чтобы оставлять ответы
                </p>
              </div>
            )}

            {topic.is_locked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4 text-center">
                <p className="text-body text-yellow-800">
                  Эта тема заблокирована для новых ответов
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

