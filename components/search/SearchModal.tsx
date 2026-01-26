'use client'

import { FC, useState, useEffect, useRef } from 'react'
import { X, Search, BookOpen, Database, HelpCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  type: 'article' | 'knowledge' | 'faq'
  id: string
  title: string
  description: string
  url: string
  category?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Фокус на input при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Поиск с debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setHasSearched(false)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('Search failed')
        }
        const data = await response.json()
        setResults(data.results || [])
        setHasSearched(true)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Search error:', error)
        }
        setResults([])
        setHasSearched(true)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleClose = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    onClose()
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-5 h-5" />
      case 'knowledge':
        return <Database className="w-5 h-5" />
      case 'faq':
        return <HelpCircle className="w-5 h-5" />
      default:
        return <Search className="w-5 h-5" />
    }
  }

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return 'Статья'
      case 'knowledge':
        return 'База знаний'
      case 'faq':
        return 'FAQ'
      default:
        return ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-24 md:w-full md:max-w-2xl z-50 bg-white rounded-2xl shadow-strong border border-lavender-bg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-lavender-bg">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по статьям, базе знаний, FAQ..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-deep-navy"
                />
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-deep-navy hover:text-primary-purple transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary-purple animate-spin" />
                </div>
              )}

              {!isSearching && query.trim().length < 2 && (
                <div className="p-8 text-center text-deep-navy/60">
                  <Search className="w-12 h-12 mx-auto mb-4 text-deep-navy/20" />
                  <p className="text-body">Введите минимум 2 символа для поиска</p>
                </div>
              )}

              {!isSearching && hasSearched && results.length === 0 && query.trim().length >= 2 && (
                <div className="p-8 text-center text-deep-navy/60">
                  <Search className="w-12 h-12 mx-auto mb-4 text-deep-navy/20" />
                  <p className="text-body">Ничего не найдено</p>
                  <p className="text-body-small mt-2">Попробуйте изменить запрос</p>
                </div>
              )}

              {!isSearching && results.length > 0 && (
                <div className="p-2">
                  <div className="text-body-small text-deep-navy/60 px-4 py-2 mb-2">
                    Найдено: {results.length}
                  </div>
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.url}
                      onClick={handleClose}
                      className="block p-4 hover:bg-lavender-bg transition-colors border-b border-lavender-bg last:border-b-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-primary-purple mt-0.5">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-body-small font-semibold text-primary-purple">
                              {getResultTypeLabel(result.type)}
                            </span>
                            {result.category && (
                              <>
                                <span className="text-deep-navy/30">•</span>
                                <span className="text-body-small text-deep-navy/60">
                                  {result.category}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="text-body font-semibold text-deep-navy mb-1 line-clamp-1">
                            {result.title}
                          </h3>
                          <p className="text-body-small text-deep-navy/70 line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </Link>
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

