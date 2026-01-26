'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { MessageCircle, Plus, Eye, Clock, User, Pin, Lock, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { CreateTopicModal } from './CreateTopicModal'
import { TopicDetailModal } from './TopicDetailModal'

interface Category {
  id: string
  name: string
  description: string | null
  slug: string
}

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
  category?: {
    name: string
    slug: string
  }
}

const COMMUNITY_EMAIL_KEY = 'bezpauzy_community_email'

export const ForumSection: FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(COMMUNITY_EMAIL_KEY)
      setUserEmail(savedEmail)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/forum/categories')
      const result = await response.json()
      if (result.categories) {
        setCategories(result.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }, [])

  const loadTopics = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = selectedCategory
        ? `/api/forum/topics?category_id=${selectedCategory}`
        : '/api/forum/topics'
      const response = await fetch(url)
      const result = await response.json()
      if (result.topics) {
        setTopics(result.topics)
      }
    } catch (error) {
      console.error('Error loading topics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadCategories()
    loadTopics()
  }, [loadCategories, loadTopics])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return 'Сегодня'
    } else if (days === 1) {
      return 'Вчера'
    } else if (days < 7) {
      return `${days} дней назад`
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  const handleTopicCreated = () => {
    setIsCreateModalOpen(false)
    loadTopics()
  }

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic)
    // Increment views count
    fetch(`/api/forum/topics/${topic.id}/view`, { method: 'POST' }).catch(console.error)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-h2 font-bold text-deep-navy mb-2">
              Форум сообщества
            </h2>
            <p className="text-body text-deep-navy/70">
              Общайтесь с другими участницами, задавайте вопросы и делитесь опытом
            </p>
          </div>
          {userEmail && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Создать тему</span>
            </button>
          )}
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary-purple text-white'
                  : 'bg-white text-deep-navy hover:bg-lavender-bg border border-lavender-bg'
              }`}
            >
              Все категории
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-purple text-white'
                    : 'bg-white text-deep-navy hover:bg-lavender-bg border border-lavender-bg'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Topics List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
            <p className="mt-4 text-deep-navy/60">Загрузка тем...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-card p-12 text-center shadow-card">
            <MessageCircle className="w-16 h-16 text-deep-navy/20 mx-auto mb-4" />
            <h3 className="text-h4 font-semibold text-deep-navy mb-2">
              Пока нет тем
            </h3>
            <p className="text-body text-deep-navy/70 mb-6">
              Станьте первой, кто создаст тему для обсуждения!
            </p>
            {userEmail && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-strong transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Создать первую тему</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                onClick={() => handleTopicClick(topic)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {topic.is_pinned && (
                            <Pin className="w-4 h-4 text-primary-purple" />
                          )}
                          {topic.is_locked && (
                            <Lock className="w-4 h-4 text-deep-navy/40" />
                          )}
                          <h3 className="text-h5 font-semibold text-deep-navy group-hover:text-primary-purple transition-colors">
                            {topic.title}
                          </h3>
                        </div>
                        {topic.category && (
                          <span className="inline-block px-3 py-1 bg-primary-purple/10 text-primary-purple text-xs font-semibold rounded-full mb-2">
                            {topic.category.name}
                          </span>
                        )}
                        <p className="text-body-small text-deep-navy/70 line-clamp-2 mb-3">
                          {topic.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-caption text-deep-navy/60">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{topic.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        <span>{topic.replies_count} ответов</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{topic.views_count} просмотров</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(topic.last_reply_at || topic.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Telegram Alternative */}
        <div className="bg-lavender-bg rounded-card p-6 mt-8">
          <div className="flex items-start gap-4">
            <MessageCircle className="w-6 h-6 text-primary-purple flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-h5 font-semibold text-deep-navy mb-2">
                Также доступно в Telegram
              </h4>
              <p className="text-body text-deep-navy/70 mb-4">
                Вы можете общаться как здесь на сайте, так и в нашей Telegram-группе. Выбирайте удобный для вас формат!
              </p>
              <a
                href="https://t.me/bezpauzy_community"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white rounded-full font-semibold hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                <span>Перейти в Telegram-группу</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <CreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTopicCreated}
        categories={categories}
        userEmail={userEmail}
      />

      {selectedTopic && (
        <TopicDetailModal
          topic={selectedTopic}
          isOpen={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onReplyAdded={() => {
            loadTopics()
            if (selectedTopic) {
              // Reload topic to get updated reply count
              fetch(`/api/forum/topics?category_id=${selectedTopic.category_id}`)
                .then(res => res.json())
                .then(result => {
                  const updatedTopic = result.topics?.find((t: Topic) => t.id === selectedTopic.id)
                  if (updatedTopic) {
                    setSelectedTopic(updatedTopic)
                  }
                })
            }
          }}
          userEmail={userEmail}
        />
      )}
    </>
  )
}

