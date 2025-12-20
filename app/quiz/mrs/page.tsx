import { FC } from 'react'
import { Metadata } from 'next'
import { MRSQuizInterface } from '@/components/quiz/MRSQuizInterface'

export const metadata: Metadata = {
  title: 'Menopause Rating Scale (MRS) | Без |Паузы',
  description: 'Пройдите квиз Menopause Rating Scale, чтобы оценить уровень тяжести симптомов менопаузы и получить персонализированные рекомендации.',
}

const MRSQuizPage: FC = () => {
  return <MRSQuizInterface />
}

export default MRSQuizPage

