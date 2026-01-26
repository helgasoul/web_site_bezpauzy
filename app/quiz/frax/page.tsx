import { FC } from 'react'
import { Metadata } from 'next'
import { FRAXQuizInterface } from '@/components/quiz/FRAXQuizInterface'

export const metadata: Metadata = {
  title: 'Оценка риска переломов (FRAX) | Без |Паузы',
  description: 'Пройдите квиз FRAX для оценки 10-летнего риска переломов на основе факторов риска остеопороза. Получите персонализированные рекомендации.',
}

const FRAXQuizPage: FC = () => {
  return <FRAXQuizInterface />
}

export default FRAXQuizPage

