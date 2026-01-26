import { Metadata } from 'next'
import { CookieManager } from '@/components/cookies/CookieManager'

export const metadata: Metadata = {
  title: 'Управление cookie | Без |Паузы',
  description: 'Настройте использование cookie на сайте "Без |Паузы". Выберите, какие категории cookie вы разрешаете.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiesPage() {
  return <CookieManager />
}

