import { FC } from 'react'
import { Metadata } from 'next'
import { WHRQuizInterface } from '@/components/quiz/WHRQuizInterface'

export const metadata: Metadata = {
  title: 'Калькулятор метаболического здоровья (WHR + ИМТ) | Без |Паузы',
  description:
    'Оцените распределение жира в теле и метаболические риски. Особенно важен для женщин в менопаузе.',
  keywords: [
    'WHR калькулятор',
    'ИМТ калькулятор',
    'метаболическое здоровье',
    'менопауза',
    'распределение жира',
    'талия бёдра',
  ],
  openGraph: {
    title: 'Калькулятор метаболического здоровья (WHR + ИМТ)',
    description: 'Оцените распределение жира в теле и метаболические риски',
    type: 'website',
  },
}

const WHRQuizPage: FC = () => {
  return <WHRQuizInterface />
}

export default WHRQuizPage

