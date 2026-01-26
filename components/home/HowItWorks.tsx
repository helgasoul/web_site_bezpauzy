import { FC } from 'react'
import { MessageSquare, Brain, CheckCircle } from 'lucide-react'

interface HowItWorksProps {}

export const HowItWorks: FC<HowItWorksProps> = () => {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Задайте вопрос',
      description: 'В Telegram или на сайте',
    },
    {
      icon: Brain,
      title: 'Получите ответ',
      description: 'На основе науки',
    },
    {
      icon: CheckCircle,
      title: 'Действуйте',
      description: 'Врачи, видео, поддержка',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
          Как работает Ева?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-10 h-10 text-soft-white" />
                </div>
                <div className="text-h4 font-semibold text-deep-navy">
                  {index + 1}. {step.title}
                </div>
                <p className="text-body text-deep-navy/70">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

