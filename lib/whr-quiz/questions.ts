import type { WHRQuestion } from '@/lib/types/whr-quiz'

export const WHR_QUESTIONS: WHRQuestion[] = [
  {
    id: 'height',
    text: 'Укажите ваш рост',
    placeholder: 'Например, 165',
    unit: 'см',
    min: 100,
    max: 250,
    step: 1,
    required: true,
  },
  {
    id: 'weight',
    text: 'Укажите ваш вес',
    placeholder: 'Например, 65',
    unit: 'кг',
    min: 30,
    max: 200,
    step: 0.1,
    required: true,
  },
  {
    id: 'waist',
    text: 'Укажите обхват талии',
    placeholder: 'Измерьте на уровне пупка',
    unit: 'см',
    min: 50,
    max: 200,
    step: 0.5,
    required: true,
  },
  {
    id: 'hip',
    text: 'Укажите обхват бёдер',
    placeholder: 'Измерьте в самой широкой части',
    unit: 'см',
    min: 60,
    max: 200,
    step: 0.5,
    required: true,
  },
]

