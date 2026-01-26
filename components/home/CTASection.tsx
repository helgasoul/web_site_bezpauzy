import { FC } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface CTASectionProps {}

export const CTASection: FC<CTASectionProps> = () => {
  return (
    <section className="py-16 md:py-24 bg-deep-navy text-soft-white relative overflow-hidden">
      {/* Wave pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="wave-bg" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-h2 font-bold text-soft-white">
            Готовы начать путь без паузы?
          </h2>
          <p className="text-body-large text-soft-white/80">
            10 бесплатных вопросов в день
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bot">
              <Button variant="ghost" className="w-full sm:w-auto">
                Спросить Еву →
              </Button>
            </Link>
          </div>
          <p className="text-body-small text-soft-white/60">
            или{' '}
            <Link href="/newsletter" className="underline hover:text-ocean-wave-start transition-colors">
              подпишитесь на рассылку
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

