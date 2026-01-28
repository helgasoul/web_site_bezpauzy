import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { WebVitalsReporter } from '@/components/performance/WebVitalsReporter'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const montserrat = Montserrat({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'),
  title: 'Без |Паузы — Научная поддержка для женщин 40+',
  description: 'Научно обоснованная поддержка для женщин 40+ в период менопаузы. Консультации с AI, врачи, видео и книга.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com',
  },
  openGraph: {
    title: 'Без |Паузы — Научная поддержка для женщин 40+',
    description: 'Научно обоснованная поддержка для женщин 40+ в период менопаузы. Консультации с AI, врачи, видео и книга.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'Без |Паузы',
      },
    ],
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="font-inter antialiased">
        <ErrorBoundary>
          <WebVitalsReporter />
          <ConditionalLayout>{children}</ConditionalLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}
