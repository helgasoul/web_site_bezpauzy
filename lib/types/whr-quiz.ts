// Types for WHR (Waist-to-Hip Ratio) Quiz

export interface WHRAnswers {
  height: number // в см
  weight: number // в кг
  waist: number // обхват талии в см
  hip: number // обхват бёдер в см
}

export interface WHRResults {
  bmi: number // Индекс массы тела
  whr: number // Соотношение талии и бёдер
  whtr: number // Соотношение талии и роста
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese'
  whrCategory: 'low' | 'moderate' | 'high' | 'very_high'
  whtrCategory: 'low' | 'moderate' | 'high' | 'very_high'
  overallRisk: 'low' | 'moderate' | 'high' | 'very_high'
  recommendations: string[]
}

export interface WHRQuestion {
  id: keyof WHRAnswers
  text: string
  placeholder?: string
  unit: string
  min?: number
  max?: number
  step?: number
  required: boolean
}

