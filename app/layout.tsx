import type { Metadata } from 'next'
import { Inter, Montserrat, Playfair_Display } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Без |Паузы — Твоя энергия без паузы',
  description: 'Научно обоснованная поддержка для женщин 40+ в период менопаузы. Консультации с AI, врачи, видео и книга.',
  keywords: ['менопауза', 'климакс', 'женское здоровье', 'гормоны', 'ЗГТ'],
  authors: [{ name: 'Без |Паузы' }],
  openGraph: {
    title: 'Без |Паузы — Твоя энергия без паузы',
    description: 'Научно обоснованная поддержка для женщин 40+ в период менопаузы',
    type: 'website',
    locale: 'ru_RU',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable} ${playfair.variable}`}>
      <body className={`${montserrat.variable} ${inter.variable} ${playfair.variable} font-inter`}>
        {children}
      </body>
    </html>
  )
}

