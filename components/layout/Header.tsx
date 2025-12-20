'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/auth/AuthModal'

interface HeaderProps {}

export const Header: FC<HeaderProps> = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Проверяем сессию при загрузке
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/telegram/get-session')
      const data = await response.json()
      setIsAuthenticated(data.authenticated || false)
    } catch (error) {
      console.error('Error checking session:', error)
      setIsAuthenticated(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      router.push('/account')
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const navItems = [
    { label: 'Журнал', href: '/blog' },
    { label: 'Сообщество', href: '/community' },
    { label: 'База знаний', href: '/knowledge-base' },
    { label: 'Книга', href: '/book' },
    { label: 'Врачи', href: '/doctors' },
    { label: 'Ассистент Ева', href: '/bot' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-soft-white/95 backdrop-blur-sm border-b border-lavender-bg">
      <nav className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Без |Паузы"
              width={48}
              height={48}
              className="object-contain h-12 w-auto"
              priority
            />
            <div className="text-2xl font-heading font-bold text-deep-navy">
              Без |Паузы
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-body text-deep-navy hover:text-primary-purple transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ocean-wave-start group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            <button
              onClick={handleAuthClick}
              className="px-6 py-2 text-body font-medium text-deep-navy hover:text-primary-purple transition-colors flex items-center gap-2"
              disabled={isCheckingAuth}
            >
              {isAuthenticated ? (
                <>
                  <User size={18} />
                  <span>Личный кабинет</span>
                </>
              ) : (
                <span>Войти в аккаунт</span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-deep-navy"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-lavender-bg">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-body text-deep-navy hover:text-primary-purple transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  handleAuthClick()
                }}
                className="text-body font-medium text-deep-navy hover:text-primary-purple transition-colors py-2 text-left flex items-center gap-2"
                disabled={isCheckingAuth}
              >
                {isAuthenticated ? (
                  <>
                    <User size={18} />
                    <span>Личный кабинет</span>
                  </>
                ) : (
                  <span>Войти в аккаунт</span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  )
}

