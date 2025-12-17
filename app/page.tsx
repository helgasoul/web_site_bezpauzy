import { HeroSection } from '@/components/home/HeroSection'
import { SocialProof } from '@/components/home/SocialProof'
import { ProblemSolution } from '@/components/home/ProblemSolution'
import { CommunitySection } from '@/components/home/CommunitySection'
import { LatestArticles } from '@/components/home/LatestArticles'
import { BookTeaser } from '@/components/home/BookTeaser'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'
import { CTASection } from '@/components/home/CTASection'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ProblemSolution />
      <SocialProof />
      <CommunitySection />
      <LatestArticles />
      <BookTeaser />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
      <AskEvaWidget />
    </main>
  )
}
