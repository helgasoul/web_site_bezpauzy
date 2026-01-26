import type { Metadata } from 'next'
import { BackButton } from '@/components/ui/BackButton'
import { BotHero } from '@/components/bot/BotHero'
import { BotIntroVideo } from '@/components/bot/BotIntroVideo'
import { BotHowItWorks } from '@/components/bot/BotHowItWorks'
import { BotExampleConversation } from '@/components/bot/BotExampleConversation'
import { BotFeatures } from '@/components/bot/BotFeatures'
import { BotPricing } from '@/components/bot/BotPricing'
import { BotTrust } from '@/components/bot/BotTrust'
import { BotFAQ } from '@/components/bot/BotFAQ'
import { BotCTA } from '@/components/bot/BotCTA'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

export const metadata: Metadata = {
  title: 'Ассистент Ева — AI-консультант по менопаузе | Без |Паузы',
  description: '24/7 отвечает на вопросы, рекомендует врачей, подбирает видео и поддерживает. Начните бесплатно — 10 вопросов в день.',
  keywords: ['ассистент менопауза', 'AI консультант', 'телеграм ассистент', 'менопауза помощь', 'Ева ассистент'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/bot`,
  },
  openGraph: {
    title: 'Ассистент Ева — ваш AI-консультант по менопаузе',
    description: '24/7 отвечает на вопросы о менопаузе на основе науки',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/bot`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function BotPage() {
  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <BotHero />
      <BotIntroVideo />
      <BotHowItWorks />
      <BotExampleConversation />
      <BotFeatures />
      <BotPricing />
      <BotTrust />
      <BotFAQ />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <MedicalDisclaimer variant="full" />
      </div>
      <BotCTA />
      <AskEvaWidget />
    </>
  )
}

