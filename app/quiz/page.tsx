import { BackButton } from '@/components/ui/BackButton'
import { MRSQuiz } from '@/components/quiz/MRSQuiz'

export default function QuizPage() {
  return (
    <>
      <div className="pt-8 pb-4 px-4 md:px-6 lg:px-8">
        <BackButton variant="ghost" />
      </div>
      <MRSQuiz />
    </>
  )
}

