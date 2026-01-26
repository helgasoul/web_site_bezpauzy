/**
 * Утилита для анимации элементов при появлении в viewport
 * Заменяет framer-motion для простых анимаций
 */

export function initFadeInAnimations() {
  if (typeof window === 'undefined') return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // Отключаем наблюдение после анимации для оптимизации
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  )

  // Находим все элементы с классами fade-in и scale-in
  const fadeInElements = document.querySelectorAll('.fade-in, .scale-in')
  fadeInElements.forEach((el) => observer.observe(el))

  return () => {
    fadeInElements.forEach((el) => observer.unobserve(el))
  }
}

