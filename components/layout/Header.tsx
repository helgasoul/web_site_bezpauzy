'use client'

import { FC, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User, ChevronDown, Search, ShoppingCart } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthModal } from '@/components/auth/AuthModal'
import { SearchModal } from '@/components/search/SearchModal'
import { useCartStore } from '@/lib/stores/cart-store'
import { assetUrl } from '@/lib/assets'

interface HeaderProps {}

export const Header: FC<HeaderProps> = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  
  // Получаем функцию из store
  const initializeCart = useCartStore((state) => state.initializeCart)
  // Используем селектор для автоматического обновления при изменении корзины
  const itemCount = useCartStore((state) => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  })
  
  useEffect(() => {
    setIsMounted(true)
    // Инициализируем корзину (загружает с сервера для авторизованных пользователей)
    initializeCart()
  }, [initializeCart])
  
  useEffect(() => {
    setCartItemCount(itemCount)
  }, [itemCount])
  
  // Refs for dropdowns
  const resourcesRef = useRef<HTMLDivElement>(null)
  const communityRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)

  // Реф для предотвращения множественных одновременных запросов
  const checkingSessionRef = useRef(false)
  
  // Проверяем сессию при загрузке и при изменении маршрута
  useEffect(() => {
    checkSession()
    
    // Проверяем сессию при фокусе на окне (когда пользователь возвращается на вкладку)
    // Добавлен debounce для предотвращения множественных запросов
    let focusTimeout: NodeJS.Timeout
    const handleFocus = () => {
      clearTimeout(focusTimeout)
      focusTimeout = setTimeout(() => {
        checkSession()
      }, 500) // Debounce 500ms
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearTimeout(focusTimeout)
    }
  }, [])

  const checkSession = async () => {
    // Предотвращаем множественные одновременные запросы
    if (checkingSessionRef.current) {
      return
    }
    
    checkingSessionRef.current = true
    try {
      const response = await fetch('/api/auth/telegram/get-session', {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await response.json()
      const authenticated = data.authenticated || false
      setIsAuthenticated(authenticated)
      if (authenticated && data.user) {
        setUserName(data.user.username || data.user.name || null)
      } else {
        setUserName(null)
      }
    } catch (error) {
      // Ошибки логируем только в dev режиме
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking session:', error)
      }
      setIsAuthenticated(false)
      setUserName(null)
    } finally {
      setIsCheckingAuth(false)
      checkingSessionRef.current = false
    }
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      router.push('/community/dashboard')
    } else {
      setIsAuthModalOpen(true)
    }
  }

  // Закрытие dropdown при клике вне его (только для мобильной версии)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // На десктопе (lg и выше) используем только hover, не закрываем по клику
      // Закрываем только для мобильной версии (когда мобильное меню открыто)
      const isDesktop = window.innerWidth >= 1024
      if (!isDesktop && isMenuOpen) {
        if (
          resourcesRef.current && !resourcesRef.current.contains(event.target as Node) &&
          communityRef.current && !communityRef.current.contains(event.target as Node) &&
          bookRef.current && !bookRef.current.contains(event.target as Node)
        ) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  // Навигационные элементы с выпадающими меню
  const navItems = [
    { label: 'Журнал', href: '/blog', hasDropdown: false },
    { 
      label: 'Ресурсы', 
      href: '/knowledge-base', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'База знаний', href: '/knowledge-base' },
        { label: 'Журнал', href: '/blog' },
        { label: 'noPause Подкаст', href: '/podcasts/nopause' },
        { label: 'Ева объясняет', href: '/videos/eva-explains' },
        { label: 'Квизы', href: '/quiz' },
        { label: 'FAQ', href: '/faq' },
        { label: '---', href: '#', isDivider: true },
        { label: 'Гайды', href: '/resources/guides', isHeader: true },
        { label: 'Чек-листы', href: '/resources/checklists', isHeader: true },
      ]
    },
    { 
      label: 'Сообщество', 
      href: '/community', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'Главная', href: '/community' },
        { label: 'Дашборд', href: '/community/dashboard' },
      ]
    },
    { 
      label: 'Книга', 
      href: '/book', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'О книге', href: '/book' },
        { label: 'Главы', href: '/book/chapters' },
        { label: 'Отзывы', href: '/book/reviews' },
      ]
    },
    { label: 'Эксперты проекта', href: '/doctors', hasDropdown: false },
    { label: 'Ассистент Ева', href: '/bot', hasDropdown: false },
  ]

  return (
    <header className="sticky top-0 z-50 bg-soft-white/95 backdrop-blur-sm border-b border-lavender-bg">
      <nav className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <Image
              src={assetUrl('/logo.png')}
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
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-1 justify-center min-w-0">
            {navItems.map((item) => {
              if (item.hasDropdown) {
                const isOpen = openDropdown === item.label
                const ref = item.label === 'Ресурсы' ? resourcesRef : 
                           item.label === 'Сообщество' ? communityRef : 
                           item.label === 'Книга' ? bookRef : null
                
                return (
                  <div
                    key={item.label}
                    ref={ref}
                    className="relative"
                    onMouseEnter={() => {
                      // Отменяем таймер закрытия, если он был установлен
                      if (dropdownTimeoutRef.current) {
                        clearTimeout(dropdownTimeoutRef.current)
                        dropdownTimeoutRef.current = null
                      }
                      setOpenDropdown(item.label)
                    }}
                    onMouseLeave={(e) => {
                      // Проверяем, что курсор действительно покинул весь блок (включая dropdown)
                      const relatedTarget = e.relatedTarget as HTMLElement
                      if (!ref || !ref.current || !relatedTarget) {
                        // Если нет relatedTarget, значит курсор ушел за пределы документа
                        dropdownTimeoutRef.current = setTimeout(() => {
                          setOpenDropdown(null)
                          dropdownTimeoutRef.current = null
                        }, 200)
                        return
                      }
                      
                      // Проверяем, не перешли ли мы на dropdown или его дочерние элементы
                      const isMovingToDropdown = ref.current.contains(relatedTarget)
                      if (!isMovingToDropdown) {
                        dropdownTimeoutRef.current = setTimeout(() => {
                          setOpenDropdown(null)
                          dropdownTimeoutRef.current = null
                        }, 200)
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 text-body text-deep-navy hover:text-primary-purple transition-colors relative group"
                      onMouseDown={(e) => {
                        // Предотвращаем закрытие при клике на кнопку
                        e.stopPropagation()
                      }}
                    >
                      {item.label}
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ocean-wave-start group-hover:w-full transition-all duration-300" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isOpen && item.dropdownItems && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-strong border border-lavender-bg py-2 z-50"
                        onMouseEnter={() => {
                          // Отменяем таймер закрытия при наведении на dropdown
                          if (dropdownTimeoutRef.current) {
                            clearTimeout(dropdownTimeoutRef.current)
                            dropdownTimeoutRef.current = null
                          }
                          setOpenDropdown(item.label)
                        }}
                        onMouseLeave={() => {
                          // Закрываем при уходе с dropdown
                          setOpenDropdown(null)
                        }}
                      >
                        {item.dropdownItems.map((dropdownItem, index) => {
                          // Разделитель
                          if (dropdownItem.isDivider) {
                            return (
                              <div key={`divider-${index}`} className="border-t border-lavender-bg my-2" />
                            )
                          }
                          
                          // Заголовок секции (с ссылкой)
                          if (dropdownItem.isHeader) {
                            return (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                className="block px-4 py-2 text-xs font-semibold text-deep-navy/60 uppercase tracking-wide hover:text-primary-purple transition-colors"
                              >
                                {dropdownItem.label}
                              </Link>
                            )
                          }
                          
                          // Обычный пункт меню
                          // Нормализуем пути для сравнения (убираем trailing slash)
                          const currentPath = (pathname || '').replace(/\/$/, '')
                          const linkPath = dropdownItem.href.replace(/\/$/, '')
                          // Проверяем точное совпадение
                          const isActive = currentPath === linkPath
                          // Используем уникальный ключ: id если есть, иначе href + label
                          const uniqueKey = (dropdownItem as any).id || `${dropdownItem.href}-${dropdownItem.label}`
                          return (
                            <Link
                              key={uniqueKey}
                              href={dropdownItem.href}
                              className={`block px-4 py-2 text-body transition-colors ${
                                isActive 
                                  ? 'bg-primary-purple/10 text-primary-purple font-semibold' 
                                  : 'text-deep-navy hover:bg-primary-purple/5 hover:text-primary-purple'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdown(null)
                              }}
                            >
                              {dropdownItem.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-body text-deep-navy hover:text-primary-purple transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ocean-wave-start group-hover:w-full transition-all duration-300" />
                </Link>
              )
            })}
            
          </div>
          
          {/* Right side actions - always visible */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-2 text-deep-navy hover:text-primary-purple transition-colors"
              aria-label="Поиск"
            >
              <Search size={20} />
            </button>
            
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-deep-navy hover:text-primary-purple transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart size={20} />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-purple text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Auth Button */}
            <button
              onClick={handleAuthClick}
              className={`px-4 xl:px-6 py-2 text-body font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                isAuthenticated
                  ? 'bg-primary-purple/10 text-primary-purple hover:bg-primary-purple/20 rounded-full'
                  : 'text-deep-navy hover:text-primary-purple'
              }`}
              disabled={isCheckingAuth}
            >
              {isCheckingAuth ? (
                <span className="opacity-50">Загрузка...</span>
              ) : isAuthenticated ? (
                <>
                  <User size={18} />
                  <span className="hidden xl:inline">{userName ? userName : 'Личный кабинет'}</span>
                  <span className="xl:hidden">Кабинет</span>
                </>
              ) : (
                <>
                  <User size={18} className="xl:hidden" />
                  <span className="hidden xl:inline">Войти в аккаунт</span>
                  <span className="xl:hidden">Войти</span>
                </>
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
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                if (item.hasDropdown && item.dropdownItems) {
                  const isOpen = openDropdown === item.label
                  return (
                    <div key={item.label} className="flex flex-col">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setOpenDropdown(isOpen ? null : item.label)
                        }}
                        className="flex items-center justify-between text-body text-deep-navy hover:text-primary-purple transition-colors py-2 w-full text-left"
                      >
                        <span>{item.label}</span>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      {isOpen && (
                        <div className="pl-4 space-y-1" onClick={(e) => e.stopPropagation()}>
                          {item.dropdownItems.map((dropdownItem, index) => {
                            // Разделитель
                            if (dropdownItem.isDivider) {
                              return (
                                <div key={`divider-${index}`} className="border-t border-lavender-bg my-2" />
                              )
                            }
                            
                            // Заголовок секции (с ссылкой)
                            if (dropdownItem.isHeader) {
                              return (
                                <Link
                                  key={`header-${index}`}
                                  href={dropdownItem.href}
                                  className="block text-xs font-semibold text-deep-navy/60 uppercase tracking-wide py-2 hover:text-primary-purple transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenDropdown(null)
                                  }}
                                >
                                  {dropdownItem.label}
                                </Link>
                              )
                            }
                            
                            // Обычный пункт меню
                            // Нормализуем пути для сравнения (убираем trailing slash)
                            const currentPath = (pathname || '').replace(/\/$/, '')
                            const linkPath = dropdownItem.href.replace(/\/$/, '')
                            // Проверяем точное совпадение
                            const isActive = currentPath === linkPath
                            // Используем уникальный ключ: id если есть, иначе href + label
                            const uniqueKey = (dropdownItem as any).id || `${dropdownItem.href}-${dropdownItem.label}`
                            return (
                              <Link
                                key={uniqueKey}
                                href={dropdownItem.href}
                                className={`block text-body-small transition-colors py-1 ${
                                  isActive 
                                    ? 'text-primary-purple font-semibold' 
                                    : 'text-deep-navy/70 hover:text-primary-purple'
                                }`}
                                onClick={(e) => {
                                  // Закрываем меню после клика, но не блокируем переход
                                  e.stopPropagation()
                                  setIsMenuOpen(false)
                                  setOpenDropdown(null)
                                }}
                              >
                                {dropdownItem.label}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-body text-deep-navy hover:text-primary-purple transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Cart Link (Mobile) */}
              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="text-body font-medium transition-colors py-2 text-left flex items-center gap-2 text-deep-navy hover:text-primary-purple relative"
              >
                <ShoppingCart size={18} />
                <span>Корзина</span>
                {isMounted && cartItemCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-primary-purple text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  handleAuthClick()
                }}
                className={`text-body font-medium transition-colors py-2 text-left flex items-center gap-2 ${
                  isAuthenticated
                    ? 'text-primary-purple bg-primary-purple/10 rounded-lg px-4'
                    : 'text-deep-navy hover:text-primary-purple'
                }`}
                disabled={isCheckingAuth}
              >
                {isCheckingAuth ? (
                  <span className="opacity-50">Загрузка...</span>
                ) : isAuthenticated ? (
                  <>
                    <User size={18} />
                    <span>{userName ? userName : 'Личный кабинет'}</span>
                  </>
                ) : (
                  <span>Войти в аккаунт</span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false)
          // Проверяем сессию после закрытия модального окна (на случай успешной авторизации)
          setTimeout(() => {
            checkSession()
          }, 500)
        }} 
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  )
}

