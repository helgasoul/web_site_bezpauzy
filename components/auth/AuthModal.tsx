'use client'

import { FC, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RegisterModal } from './RegisterModal'
import { WebsiteLoginModal } from './WebsiteLoginModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showWebsiteLogin, setShowWebsiteLogin] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleClose = () => {
    setShowRegisterModal(false)
    setShowWebsiteLogin(false)
    onClose()
  }

  // Первый экран (выбор «Регистрация» / «Вход») показываем только когда не открыты подмодалки
  const modalContent = isOpen && !showRegisterModal && !showWebsiteLogin && (
    <AnimatePresence>
      <div key="auth-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm pointer-events-auto"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-soft-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 md:p-10 z-10 pointer-events-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>

          {/* Content */}
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                  Вход в аккаунт
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                  Зарегистрируйтесь или войдите, чтобы получить доступ к личному кабинету
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <User className="w-5 h-5" />
                  <span>Зарегистрироваться</span>
                </button>

                <button
                  onClick={() => setShowWebsiteLogin(true)}
                  className="w-full bg-white border-2 border-primary-purple text-primary-purple px-6 py-4 rounded-xl font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Lock className="w-5 h-5" />
                  <span>Войти через логин/пароль</span>
                </button>
              </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return (
    <>
      {mounted && typeof document !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          onClose()
          router.push('/community/dashboard')
        }}
      />
      <WebsiteLoginModal
        isOpen={showWebsiteLogin}
        onClose={() => setShowWebsiteLogin(false)}
        onSuccess={() => {
          onClose()
          // WebsiteLoginModal уже проверил сессию, просто делаем редирект
          // CommunityDashboard сам проверит сессию при загрузке
          router.push('/community/dashboard')
        }}
        onSwitchToRegister={() => {
          setShowWebsiteLogin(false)
          setShowRegisterModal(true)
        }}
      />
    </>
  )
}

