import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Без |Паузы — Научная поддержка для женщин 40+',
  description: 'Научно обоснованная поддержка для женщин 40+ в период менопаузы. Консультации с AI, врачи, видео и книга.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-inter antialiased">
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
