import { FC } from 'react'
import Link from 'next/link'

interface FooterProps {}

export const Footer: FC<FooterProps> = () => {
  const navigation = {
    main: [
      { name: 'Журнал', href: '/blog' },
      { name: 'Книга', href: '/book' },
      { name: 'Врачи', href: '/doctors' },
      { name: 'О нас', href: '/about' },
    ],
    resources: [
      { name: 'База знаний', href: '/knowledge-base' },
      { name: 'Тарифы', href: '/bot#pricing' },
      { name: 'FAQ', href: '/faq' },
    ],
  }

  return (
    <footer className="bg-deep-navy text-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="col-span-1">
            <div className="text-2xl font-heading font-bold mb-4">
              Без |Паузы
            </div>
            <p className="text-body-small text-soft-white/70">
              Твоя энергия — без паузы
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-body font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-small text-soft-white/70 hover:text-ocean-wave-start transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-body font-semibold mb-4">Ресурсы</h3>
            <ul className="space-y-2">
              {navigation.resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-small text-soft-white/70 hover:text-ocean-wave-start transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-body font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-body-small text-soft-white/70">
              <li>
                <a
                  href="mailto:info@bezpauzy.com"
                  className="hover:text-ocean-wave-start transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/bezpauzy_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ocean-wave-start transition-colors"
                >
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-soft-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-caption text-soft-white/60">
              © 2024 Без |Паузы. Все права защищены.
            </p>
            <div className="flex space-x-6 text-caption text-soft-white/60">
              <Link
                href="/privacy"
                className="hover:text-ocean-wave-start transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms"
                className="hover:text-ocean-wave-start transition-colors"
              >
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
