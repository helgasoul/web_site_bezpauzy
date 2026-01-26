import { FC } from 'react'
import { Metadata } from 'next'
import { PhenoAgeQuizInterface } from '@/components/quiz/PhenoAgeQuizInterface'

export const metadata: Metadata = {
  title: 'Калькулятор биологического возраста PhenoAge | Без |Паузы',
  description: 'Определите свой биологический возраст на основе биохимических маркеров крови. Научно обоснованная методика от ученых Йельского университета.',
}

const PhenoAgeQuizPage: FC = () => {
  return <PhenoAgeQuizInterface />
}

export default PhenoAgeQuizPage

