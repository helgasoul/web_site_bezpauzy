import { HeroSection } from '@/components/home/HeroSection'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { SocialProof } from '@/components/home/SocialProof'
import { DeepLinkHandler } from '@/components/auth/DeepLinkHandler'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateOrganizationSchema } from '@/lib/seo/schema'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'
import dynamicImport from 'next/dynamic'

// Server Components - импортируем напрямую (нельзя использовать dynamic для async Server Components)
import { LatestArticles } from '@/components/home/LatestArticles'
import { Testimonials } from '@/components/home/Testimonials'

export const dynamic = 'force-dynamic'

// Dynamic imports для клиентских компонентов ниже fold (оптимизация bundle size)
const CommunitySection = dynamicImport(() => import('@/components/home/CommunitySection').then(mod => ({ default: mod.CommunitySection })), {
  loading: () => <div className="py-16 bg-lavender-bg" />,
  ssr: false,
})

const BookTeaser = dynamicImport(() => import('@/components/home/BookTeaser').then(mod => ({ default: mod.BookTeaser })), {
  loading: () => <div className="py-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start" />,
  ssr: false,
})

const HowItWorks = dynamicImport(() => import('@/components/home/HowItWorks').then(mod => ({ default: mod.HowItWorks })), {
  loading: () => <div className="py-16 bg-soft-white" />,
  ssr: false,
})

const CTASection = dynamicImport(() => import('@/components/home/CTASection').then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="py-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start" />,
  ssr: false,
})

const AskEvaWidget = dynamicImport(() => import('@/components/ui/AskEvaWidget').then(mod => ({ default: mod.AskEvaWidget })), {
  ssr: false,
  loading: () => null, // Не показываем loading для виджета
})

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema()

  return (
    <>
      <StructuredData data={organizationSchema} />
      <DeepLinkHandler />
      <HeroSection />
      <ProblemSolution />
      <SocialProof />
      <CommunitySection />
      <LatestArticles />
      <BookTeaser />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <MedicalDisclaimer variant="full" />
      </div>
      <AskEvaWidget />
    </>
  )
}


