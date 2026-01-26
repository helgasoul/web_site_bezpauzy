'use client'

import { FC, useState, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SupportModal } from './SupportModal'

interface SupportButtonProps {}

export const SupportButton: FC<SupportButtonProps> = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Show button after user scrolls down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // On desktop, always show (but check if Eva widget might overlap)
    if (window.innerWidth >= 1024) {
      setIsVisible(true)
    } else {
      handleScroll() // Check on mount for mobile
      window.addEventListener('scroll', handleScroll)
    }
    
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        setIsVisible(true)
      }
    })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Floating Button - right bottom, below Eva widget on desktop */}
      <AnimatePresence>
        {isVisible && !isModalOpen && (
          <motion.div
            className="fixed right-6 bottom-6 lg:bottom-6 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-ocean-wave-start via-ocean-wave-start/90 to-ocean-wave-end rounded-full shadow-strong flex items-center justify-center hover:scale-110 transition-transform duration-300"
              aria-label="Написать в поддержку"
            >
              <HelpCircle className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
              
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-ocean-wave-start animate-ping opacity-20" />
              
              {/* Tooltip on hover - show on left for desktop, above for mobile */}
              <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block">
                <div className="bg-deep-navy text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                  Написать в поддержку
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-deep-navy" />
                </div>
              </div>
              {/* Mobile tooltip - above */}
              <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none lg:hidden">
                <div className="bg-deep-navy text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg">
                  Написать в поддержку
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-deep-navy" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <SupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
