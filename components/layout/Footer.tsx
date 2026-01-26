import { FC } from 'react'
import Link from 'next/link'
import { Mail, Send, BookOpen, Book, Stethoscope, Info, Database, CreditCard, HelpCircle, FileText, BookMarked, Headphones, PlayCircle } from 'lucide-react'

interface FooterProps {}

export const Footer: FC<FooterProps> = () => {
  const navigation = {
    main: [
      { name: 'Журнал', href: '/blog', icon: BookOpen },
      { name: 'noPause Подкаст', href: '/podcasts/nopause', icon: Headphones },
      { name: 'Ева объясняет', href: '/videos/eva-explains', icon: PlayCircle },
      { name: 'Книга', href: '/book', icon: Book },
      { name: 'Эксперты проекта', href: '/doctors', icon: Stethoscope },
      { name: 'О проекте Без |Паузы', href: '/about', icon: Info },
    ],
    resources: [
      { name: 'База знаний', href: '/knowledge-base', icon: Database },
      { name: 'Гайды', href: '/resources/guides', icon: BookMarked },
      { name: 'Чек-листы', href: '/resources/checklists', icon: FileText },
      { name: 'Тарифы', href: '/bot#pricing', icon: CreditCard },
      { name: 'FAQ', href: '/faq', icon: HelpCircle },
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
              {navigation.main.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-body-small text-soft-white/70 hover:text-ocean-wave-start transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-body font-semibold mb-4">Ресурсы</h3>
            <ul className="space-y-2">
              {navigation.resources.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-body-small text-soft-white/70 hover:text-ocean-wave-start transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-body font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3 text-body-small text-soft-white/70">
              <li>
                <a
                  href="mailto:bez-pauzy@yandex.com"
                  className="flex items-center gap-2 hover:text-ocean-wave-start transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>bez-pauzy@yandex.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/bezpauzi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-ocean-wave-start transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram канал</span>
                </a>
              </li>
            </ul>
            
            {/* Telegram Channel Link */}
            <div className="mt-6">
              <a
                href="https://t.me/bezpauzi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-ocean-wave-start/20 hover:bg-ocean-wave-start/30 border border-ocean-wave-start/30 rounded-lg text-soft-white hover:text-ocean-wave-start transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Подписаться на канал</span>
              </a>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-12 pt-8 border-t border-soft-white/10">
          <p className="text-caption text-soft-white/60 text-center max-w-3xl mx-auto">
            Информация на сайте носит информационный характер и не является медицинской консультацией, диагностикой или планом лечения. Проконсультируйтесь с врачом перед принятием решений о здоровье.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-soft-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-caption text-soft-white/60">
              © 2025 Без |Паузы. Все права защищены.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-caption text-soft-white/60">
              <Link
                href="/legal"
                className="hover:text-ocean-wave-start transition-colors"
              >
                Правовые документы
              </Link>
              <Link
                href="/privacy"
                className="hover:text-ocean-wave-start transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/legal/cookies"
                className="hover:text-ocean-wave-start transition-colors"
              >
                Политика cookie
              </Link>
              <Link
                href="/cookies"
                className="hover:text-ocean-wave-start transition-colors"
              >
                Управление cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

