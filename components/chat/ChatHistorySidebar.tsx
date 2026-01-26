'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Download, X, MessageSquare, Bot, User, Calendar } from 'lucide-react'

interface ChatHistoryItem {
  id: string
  query_text: string | null
  response_text: string | null
  created_at: string
  type: 'user' | 'bot'
}

interface ChatHistorySidebarProps {
  userId?: string
  telegramId?: number
  isOpen: boolean
  onClose: () => void
}

export const ChatHistorySidebar: FC<ChatHistorySidebarProps> = ({
  userId,
  telegramId,
  isOpen,
  onClose,
}) => {
  const [history, setHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && (userId || telegramId)) {
      loadHistory()
    }
  }, [isOpen, userId, telegramId])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/history')
      const data = await response.json()

      if (data.success && data.messages) {
        setHistory(data.messages)
      } else {
        setHistory([])
      }
    } catch (error) {
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const downloadHistory = () => {
    if (history.length === 0) return

    // Форматируем историю для скачивания
    const formattedHistory = history
      .map((item) => {
        const date = new Date(item.created_at).toLocaleString('ru-RU')
        if (item.type === 'user') {
          return `[${date}] Вы: ${item.query_text || ''}`
        } else {
          return `[${date}] Ева: ${item.response_text || ''}`
        }
      })
      .join('\n\n')

    // Создаем файл и скачиваем
    const blob = new Blob([formattedHistory], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `eva-chat-history-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Группируем историю по датам
  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, ChatHistoryItem[]>)

  const dates = Object.keys(groupedHistory).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-deep-navy/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-purple to-ocean-wave-start p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6" />
                  <h2 className="text-xl font-bold">История диалогов</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {history.length > 0 && (
                <button
                  onClick={downloadHistory}
                  className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Скачать историю</span>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="w-16 h-16 text-deep-navy/20 mb-4" />
                  <p className="text-body text-deep-navy/60">
                    История диалогов пуста
                  </p>
                  <p className="text-sm text-deep-navy/40 mt-2">
                    Начните общение с Евой, чтобы здесь появились ваши диалоги
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dates.map((date) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-deep-navy/60 sticky top-0 bg-white py-2">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      {groupedHistory[date].map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-2xl ${
                            item.type === 'user'
                              ? 'bg-primary-purple/10 border border-primary-purple/20'
                              : 'bg-lavender-bg border border-lavender-bg'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {item.type === 'user' ? (
                              <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-deep-navy mb-1">
                                {item.type === 'user' ? 'Вы' : 'Ева'}
                              </p>
                              <p className="text-sm text-deep-navy/80 whitespace-pre-wrap break-words">
                                {item.query_text || item.response_text}
                              </p>
                              <p className="text-xs text-deep-navy/40 mt-2">
                                {new Date(item.created_at).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

