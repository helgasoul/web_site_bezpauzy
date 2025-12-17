import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BotHero } from '@/components/bot/BotHero'
import { BotFeatures } from '@/components/bot/BotFeatures'
import { BotHowItWorks } from '@/components/bot/BotHowItWorks'
import { BotExampleConversation } from '@/components/bot/BotExampleConversation'
import { BotPricing } from '@/components/bot/BotPricing'
import { BotTrust } from '@/components/bot/BotTrust'
import { BotFAQ } from '@/components/bot/BotFAQ'
import { BotCTA } from '@/components/bot/BotCTA'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export const metadata: Metadata = {
  title: 'Ассистент Ева — AI-консультант по менопаузе | Без |Паузы',
  description: 'Задавайте вопросы о менопаузе AI-ассистенту Еве. Научно обоснованные ответы 24/7.',
  keywords: ['AI', 'ассистент', 'Ева', 'менопауза', 'консультация', 'Telegram'],
  openGraph: {
    title: 'Ассистент Ева — AI-консультант по менопаузе',
    description: 'Научно обоснованные ответы о менопаузе 24/7',
    type: 'website',
  },
}

export default function BotPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <BotHero />
        <BotFeatures />
        <BotHowItWorks />
        <BotExampleConversation />
        <BotPricing />
        <BotTrust />
        <BotFAQ />
        <BotCTA />
      </main>
      <Footer />
      <AskEvaWidget />
    </>
  )
}
