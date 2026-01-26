'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Sparkles, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Resource } from '@/lib/supabase/resources'
import { BuyResourceButton } from '@/components/resources/BuyResourceButton'
import { DownloadResourceButton } from '@/components/resources/DownloadResourceButton'

interface GuidePreviewModalProps {
  guideSlug: string
  isOpen: boolean
  onClose: () => void
}

export const GuidePreviewModal: FC<GuidePreviewModalProps> = ({
  guideSlug,
  isOpen,
  onClose,
}) => {
  const [guide, setGuide] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && guideSlug) {
      setIsLoading(true)
      setError(null)
      setGuide(null)
      
      fetch(`/api/resources/${guideSlug}`)
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Гайд не найден')
          }
          return response.json()
        })
        .then((data) => {
          if (data.resource && data.resource.resourceType === 'guide') {
            setGuide(data.resource)
          } else {
            setError('Гайд не найден')
          }
        })
        .catch((err) => {
          console.error('Error loading guide:', err)
          setError(err.message || 'Ошибка при загрузке гайда')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      // Reset state when modal closes
      setGuide(null)
      setError(null)
      setIsLoading(false)
    }
  }, [isOpen, guideSlug])

  if (!isOpen) return null

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-lavender-bg px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-h4 font-bold text-deep-navy">Превью гайда</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-lavender-bg rounded-full transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5 text-deep-navy" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-purple" />
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <p className="text-body text-deep-navy/70 mb-4">{error}</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-primary-purple text-white rounded-full font-semibold hover:bg-primary-purple/90 transition-colors"
                    >
                      Закрыть
                    </button>
                  </div>
                )}

                {!isLoading && !error && guide && (
                  <>
                    {/* Cover Image */}
                    {guide.coverImage && (
                      <div className="w-full h-48 md:h-64 relative rounded-xl overflow-hidden mb-6 bg-lavender-bg">
                        <Image
                          src={guide.coverImage}
                          alt={guide.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 672px"
                        />
                        {guide.isPaid && (
                          <div className="absolute top-4 right-4">
                            <span className="px-4 py-2 bg-primary-purple text-white text-body-small font-semibold rounded-full shadow-lg">
                              {guide.priceKopecks ? `${(guide.priceKopecks / 100).toFixed(0)}₽` : 'Платно'}
                            </span>
                          </div>
                        )}
                        {!guide.isPaid && (
                          <div className="absolute top-4 right-4">
                            <span className="px-4 py-2 bg-ocean-wave-start text-white text-body-small font-semibold rounded-full shadow-lg">
                              Бесплатно
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title and Description */}
                    <div className="mb-6">
                      <h3 className="text-h3 font-bold text-deep-navy mb-3">
                        {guide.title}
                      </h3>
                      <p className="text-body text-deep-navy/80 leading-relaxed">
                        {guide.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {guide.tags && guide.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {guide.tags.slice(0, 5).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-lavender-bg text-primary-purple text-body-small rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-4 mt-8">
                      {guide.isPaid ? (
                        <BuyResourceButton resource={guide} variant="default" />
                      ) : (
                        <DownloadResourceButton 
                          resource={guide} 
                          label="Скачать бесплатно"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
