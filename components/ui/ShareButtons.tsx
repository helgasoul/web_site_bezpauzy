'use client'

import { FC, useState } from 'react'
import { Share2, MessageCircle, MessageSquare, Link2, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  variant?: 'default' | 'compact'
  className?: string
}

export const ShareButtons: FC<ShareButtonsProps> = ({
  url,
  title,
  description,
  variant = 'default',
  className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}`
    : url

  const shareText = description 
    ? `${title}\n\n${description}\n\n${fullUrl}`
    : `${title}\n\n${fullUrl}`

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl)
    const encodedTitle = encodeURIComponent(title)
    const encodedText = encodeURIComponent(shareText)

    let shareUrl = ''

    switch (platform) {
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}&description=${encodeURIComponent(description || '')}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`
        break
      case 'viber':
        shareUrl = `viber://forward?text=${encodedText}`
        break
      case 'odnoklassniki':
        shareUrl = `https://connect.ok.ru/offer?url=${encodedUrl}&title=${encodedTitle}`
        break
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      setIsOpen(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setIsOpen(false)
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setIsOpen(false)
    }
  }

  const shareOptions = [
    {
      id: 'telegram',
      label: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => handleShare('telegram'),
    },
    {
      id: 'vk',
      label: 'ВКонтакте',
      icon: MessageSquare,
      color: 'bg-[#0077FF] hover:bg-[#0066DD]',
      onClick: () => handleShare('vk'),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#20BA5A]',
      onClick: () => handleShare('whatsapp'),
    },
    {
      id: 'viber',
      label: 'Viber',
      icon: MessageCircle,
      color: 'bg-[#665CAC] hover:bg-[#554A9A]',
      onClick: () => handleShare('viber'),
    },
    {
      id: 'odnoklassniki',
      label: 'Одноклассники',
      icon: MessageSquare,
      color: 'bg-[#EE8208] hover:bg-[#DD7200]',
      onClick: () => handleShare('odnoklassniki'),
    },
  ]

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 text-primary-purple rounded-full text-body-small font-medium hover:bg-primary-purple/20 transition-colors"
          aria-label="Поделиться"
        >
          <Share2 className="w-4 h-4" />
          <span>Поделиться</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-strong border border-lavender-bg p-3 z-50 min-w-[200px]"
              >
                <div className="grid grid-cols-2 gap-2">
                  {shareOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        onClick={option.onClick}
                        className={`${option.color} text-white px-4 py-2 rounded-lg text-body-small font-medium transition-colors flex items-center gap-2 justify-center`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                  <button
                    onClick={handleCopyLink}
                    className="col-span-2 bg-lavender-bg text-deep-navy px-4 py-2 rounded-lg text-body-small font-medium hover:bg-primary-purple/10 transition-colors flex items-center gap-2 justify-center"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Копировать ссылку</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-body-small text-deep-navy/70 font-medium">Поделиться:</span>
      {shareOptions.map((option) => {
        const Icon = option.icon
        return (
          <button
            key={option.id}
            onClick={option.onClick}
            className={`${option.color} text-white px-4 py-2 rounded-lg text-body-small font-medium transition-colors flex items-center gap-2 hover:scale-105`}
            aria-label={`Поделиться в ${option.label}`}
          >
            <Icon className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        )
      })}
      <button
        onClick={handleCopyLink}
        className="bg-lavender-bg text-deep-navy px-4 py-2 rounded-lg text-body-small font-medium hover:bg-primary-purple/10 transition-colors flex items-center gap-2"
        aria-label="Копировать ссылку"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-primary-purple" />
            <span className="text-primary-purple">Скопировано!</span>
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            <span>Копировать ссылку</span>
          </>
        )}
      </button>
    </div>
  )
}

