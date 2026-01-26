'use client'

import { FC, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, MessageCircle, History } from 'lucide-react'
import Image from 'next/image'
import { ChatHistorySidebar } from './ChatHistorySidebar'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
}

interface ChatInterfaceProps {
  userId?: string
  telegramId?: number
  quizContext?: {
    quizType: 'inflammation' | 'mrs'
    level?: string
    score?: number
  }
  articleSlug?: string
}

export const ChatInterface: FC<ChatInterfaceProps> = ({ userId, telegramId, quizContext, articleSlug }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Загрузка истории сообщений
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId && !telegramId) {
        setIsLoadingHistory(false)
        // Добавляем приветственное сообщение с контекстом квиза или статьи
        let welcomeText = 'Привет! Я Ева, ваш персональный помощник по женскому здоровью. Чем могу помочь?'
        
        if (quizContext) {
          const quizName = quizContext.quizType === 'inflammation' ? 'Индекс воспаления' : 'Шкала MRS'
          welcomeText = `Привет! Я вижу, что вы только что прошли квиз "${quizName}". ${quizContext.level ? `Ваш результат: ${quizContext.level}.` : ''} Чем могу помочь? Могу ответить на вопросы о результатах, дать рекомендации или объяснить, что означают ваши баллы.`
        } else if (articleSlug) {
          welcomeText = 'Привет! Я вижу, что вы читали статью. Есть вопросы по этой теме? Я могу помочь разобраться и дать персональные рекомендации.'
        }
        
        setMessages([
          {
            id: 'welcome',
            text: welcomeText,
            sender: 'bot',
            timestamp: new Date(),
          },
        ])
        return
      }

      try {
        const response = await fetch('/api/chat/history')
        const data = await response.json()

        if (data.success && data.messages && data.messages.length > 0) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.response_text || msg.query_text || '',
            sender: msg.type === 'user' || msg.query_text ? 'user' : 'bot',
            timestamp: new Date(msg.created_at),
          }))
          setMessages(formattedMessages)
        } else {
          // Приветственное сообщение, если истории нет
          let welcomeText = 'Привет! Я Ева, ваш персональный помощник по женскому здоровью. Чем могу помочь?'
          
          if (quizContext) {
            const quizName = quizContext.quizType === 'inflammation' ? 'Индекс воспаления' : 'Шкала MRS'
            welcomeText = `Привет! Я вижу, что вы только что прошли квиз "${quizName}". ${quizContext.level ? `Ваш результат: ${quizContext.level}.` : ''} Чем могу помочь? Могу ответить на вопросы о результатах, дать рекомендации или объяснить, что означают ваши баллы.`
          } else if (articleSlug) {
            welcomeText = 'Привет! Я вижу, что вы читали статью. Есть вопросы по этой теме? Я могу помочь разобраться и дать персональные рекомендации.'
          }
          
          setMessages([
            {
              id: 'welcome',
              text: welcomeText,
              sender: 'bot',
              timestamp: new Date(),
            },
          ])
        }
      } catch (error) {
        // Приветственное сообщение при ошибке
        let welcomeText = 'Привет! Я Ева, ваш персональный помощник по женскому здоровью. Чем могу помочь?'
        
        if (quizContext) {
          const quizName = quizContext.quizType === 'inflammation' ? 'Индекс воспаления' : 'Шкала MRS'
          welcomeText = `Привет! Я вижу, что вы только что прошли квиз "${quizName}". ${quizContext.level ? `Ваш результат: ${quizContext.level}.` : ''} Чем могу помочь?`
        } else if (articleSlug) {
          welcomeText = 'Привет! Я вижу, что вы читали статью. Есть вопросы по этой теме?'
        }
        
        setMessages([
          {
            id: 'welcome',
            text: welcomeText,
            sender: 'bot',
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [userId, telegramId, quizContext, articleSlug])

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    const botMessagePlaceholder: Message = {
      id: `loading-${Date.now()}`,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, botMessagePlaceholder])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          userId,
          telegramId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const messageId = data.messageId || Date.now().toString()
        
        // Если ответ получен сразу
        if (data.response) {
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.id !== botMessagePlaceholder.id)
            return [
              ...filtered,
              {
                id: messageId,
                text: data.response,
                sender: 'bot',
                timestamp: new Date(),
              },
            ]
          })
          setIsLoading(false)
        } else {
          // Если ответ обрабатывается, запускаем polling
          pollForResponse(messageId, botMessagePlaceholder.id)
        }
      } else {
        throw new Error(data.error || 'Не удалось получить ответ')
      }
    } catch (error: any) {
      // Удаляем placeholder и добавляем сообщение об ошибке
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== botMessagePlaceholder.id)
        return [
          ...filtered,
          {
            id: `error-${Date.now()}`,
            text: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Polling для получения ответа
  const pollForResponse = async (queryId: string, placeholderId: string) => {
    let attempts = 0
    const maxAttempts = 30 // 30 попыток = ~1 минута (каждые 2 секунды)
    const pollInterval = 2000 // 2 секунды

    const poll = async () => {
      if (attempts >= maxAttempts) {
        // Превышено время ожидания
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== placeholderId)
          return [
            ...filtered,
            {
              id: `timeout-${Date.now()}`,
              text: 'Извините, ответ занимает больше времени, чем ожидалось. Пожалуйста, проверьте ответ в Telegram боте или попробуйте позже.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]
        })
        setIsLoading(false)
        return
      }

      attempts++

      try {
        const response = await fetch(`/api/chat/poll?lastQueryId=${queryId}&lastTimestamp=${new Date().toISOString()}`)
        const data = await response.json()

        if (data.success && data.hasUpdate && data.response) {
          // Получен ответ, обновляем сообщение
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.id !== placeholderId)
            return [
              ...filtered,
              {
                id: queryId,
                text: data.response,
                sender: 'bot',
                timestamp: new Date(data.updatedAt),
              },
            ]
          })
          setIsLoading(false)
        } else if (data.status === 'completed' && !data.hasUpdate) {
          // Запрос завершен, но ответ уже был показан
          setIsLoading(false)
        } else {
          // Продолжаем polling
          setTimeout(poll, pollInterval)
        }
      } catch (error) {
        // Ошибка при polling, продолжаем попытки
        setTimeout(poll, pollInterval)
      }
    }

    // Начинаем polling через 2 секунды
    setTimeout(poll, pollInterval)
  }

  return (
    <div className="flex h-full bg-gradient-to-b from-soft-white to-white relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-purple to-ocean-wave-start p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/ChatGPT Image Dec 19, 2025 at 10_44_36 PM.png"
                  alt="Ева"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ева</h2>
                <p className="text-sm text-white/80">Ваш помощник по женскому здоровью</p>
              </div>
            </div>
            {(userId || telegramId) && (
              <button
                onClick={() => setIsHistorySidebarOpen(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Открыть историю"
                title="История диалогов"
              >
                <History className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary-purple animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src="/ChatGPT Image Dec 19, 2025 at 10_44_36 PM.png"
                      alt="Ева"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white'
                      : 'bg-lavender-bg text-deep-navy'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Ева печатает...</span>
                    </div>
                  ) : (
                    <p className="text-body whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  )}
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-deep-navy/60'}`}>
                    {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-10 h-10 bg-deep-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-deep-navy" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-lavender-bg p-4 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите ваш вопрос..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-lavender-bg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none resize-none text-body bg-white text-deep-navy placeholder:text-deep-navy/40"
              style={{
                minHeight: '52px',
                maxHeight: '120px',
              }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-deep-navy/60 mt-2 text-center">
          Нажмите Enter для отправки, Shift+Enter для новой строки
        </p>
      </div>
      </div>

      {/* History Sidebar */}
      <ChatHistorySidebar
        userId={userId}
        telegramId={telegramId}
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
      />
    </div>
  )
}

