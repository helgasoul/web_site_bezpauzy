import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BotHero } from '@/components/bot/BotHero'
import { BotHowItWorks } from '@/components/bot/BotHowItWorks'
import { BotExampleConversation } from '@/components/bot/BotExampleConversation'
import { BotFeatures } from '@/components/bot/BotFeatures'
import { BotPricing } from '@/components/bot/BotPricing'
import { BotTrust } from '@/components/bot/BotTrust'
import { BotFAQ } from '@/components/bot/BotFAQ'
import { BotCTA } from '@/components/bot/BotCTA'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export const metadata: Metadata = {
  title: 'Ассистент Ева — AI-консультант по менопаузе | Без |Паузы',
  description: '24/7 отвечает на вопросы, рекомендует врачей, подбирает видео и поддерживает. Начните бесплатно — 10 вопросов в день.',
  keywords: ['ассистент менопауза', 'AI консультант', 'телеграм ассистент', 'менопауза помощь', 'Ева ассистент'],
  openGraph: {
    title: 'Ассистент Ева — ваш AI-консультант по менопаузе',
    description: '24/7 отвечает на вопросы о менопаузе на основе науки',
    type: 'website',
  },
}

export default function BotPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <BotHero />
        <BotHowItWorks />
        <BotExampleConversation />
        <BotFeatures />
        <BotPricing />
        <BotTrust />
        <BotFAQ />
        <BotCTA />
        <AskEvaWidget />
      </main>
      <Footer />
    </>
  )
}

