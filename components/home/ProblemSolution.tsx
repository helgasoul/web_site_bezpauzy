import { FC } from 'react'
import { Droplet, HelpCircle, Heart } from 'lucide-react'

interface ProblemSolutionProps {}

export const ProblemSolution: FC<ProblemSolutionProps> = () => {
  const cards = [
    {
      icon: Droplet,
      title: 'Знакомые симптомы?',
      description: 'Приливы, бессонница, настроение, вес...',
    },
    {
      icon: HelpCircle,
      title: 'Научные ответы',
      description: 'От гинеколога, маммолога, психолога',
    },
    {
      icon: Heart,
      title: 'Персональная помощь',
      description: 'AI-консультант Ева 24/7 с вами',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                className="bg-soft-white border border-lavender-bg rounded-card p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-soft-white" />
                </div>
                <h3 className="text-h4 font-semibold text-deep-navy mb-3">
                  {card.title}
                </h3>
                <p className="text-body text-deep-navy/70">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

