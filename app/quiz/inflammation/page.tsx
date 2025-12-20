import { FC } from 'react'
import { Metadata } from 'next'
import { InflammationQuizInterface } from '@/components/quiz/InflammationQuizInterface'

export const metadata: Metadata = {
  title: 'Индекс воспаления: бесплатный квиз | Без |Паузы',
  description: 'Узнайте уровень хронического воспаления в вашем организме. Персонализированные рекомендации по питанию и образу жизни для женщин в менопаузе.',
}

const InflammationQuizPage: FC = () => {
  return <InflammationQuizInterface />
}

export default InflammationQuizPage

