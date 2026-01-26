import { FC } from 'react'
import { Metadata } from 'next'
import { QuizResultsHistory } from '@/components/account/QuizResultsHistory'

export const metadata: Metadata = {
  title: 'Мои результаты квизов | Без |Паузы',
  description: 'Просмотрите историю ваших результатов квизов и отслеживайте изменения со временем.',
}

const QuizResultsPage: FC = () => {
  return <QuizResultsHistory />
}

export default QuizResultsPage
