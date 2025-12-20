import { z } from 'zod'

// Enum для уровня воспаления
export const InflammationLevelEnum = z.enum([
  'very_low',
  'low',
  'moderate',
  'elevated',
  'high'
])
export type InflammationLevel = z.infer<typeof InflammationLevelEnum>

// Enum для возраста
export const AgeRangeEnum = z.enum(['35-39', '40-44', '45-49', '50-54', '55-59', '60+'])
export type AgeRange = z.infer<typeof AgeRangeEnum>

// Enum для категорий риска
export const RiskCategoryEnum = z.enum([
  'processed_meat',
  'refined_carbs',
  'omega3_deficiency',
  'low_fiber',
  'excessive_alcohol',
  'sedentary',
  'poor_sleep',
  'high_stress',
  'smoking',
  'obesity',
  'abdominal_obesity'
])
export type RiskCategory = z.infer<typeof RiskCategoryEnum>

// Схема демографических данных
export const DemographicsSchema = z.object({
  age_range: AgeRangeEnum,
  height_cm: z.number().int().min(100).max(250),
  weight_kg: z.number().min(30).max(300),
  waist_circumference_cm: z.number().int().min(50).max(200).optional()
})
export type Demographics = z.infer<typeof DemographicsSchema>

// Схема ответов на вопросы о питании (15 вопросов)
export const DietAnswersSchema = z.object({
  diet_leafy_greens: z.number().int().min(-2).max(3),
  diet_berries: z.number().int().min(-2).max(3),
  diet_fatty_fish: z.number().int().min(-2).max(3),
  diet_nuts: z.number().int().min(-2).max(3),
  diet_olive_oil: z.number().int().min(-2).max(3),
  diet_whole_grains: z.number().int().min(-2).max(3),
  diet_legumes: z.number().int().min(-2).max(3),
  diet_turmeric_spices: z.number().int().min(-2).max(3),
  diet_processed_meat: z.number().int().min(-2).max(3),
  diet_red_meat: z.number().int().min(-2).max(3),
  diet_refined_carbs: z.number().int().min(-2).max(3),
  diet_sugary_drinks: z.number().int().min(-2).max(3),
  diet_fried_foods: z.number().int().min(-2).max(3),
  diet_alcohol: z.number().int().min(-2).max(3),
  diet_trans_fats: z.number().int().min(-2).max(3)
})
export type DietAnswers = z.infer<typeof DietAnswersSchema>

// Схема ответов на вопросы об образе жизни (7 вопросов)
export const LifestyleAnswersSchema = z.object({
  lifestyle_physical_activity: z.number().int().min(-2).max(3),
  lifestyle_sleep_duration: z.number().int().min(-2).max(3),
  lifestyle_sleep_quality: z.number().int().min(-2).max(3),
  lifestyle_stress_level: z.number().int().min(-2).max(3),
  lifestyle_smoking: z.number().int().min(0).max(3),
  lifestyle_sitting_time: z.number().int().min(-1).max(3),
  lifestyle_stress_management: z.number().int().min(-2).max(0)
})
export type LifestyleAnswers = z.infer<typeof LifestyleAnswersSchema>

// Полная схема ответов
export const InflammationAnswersSchema = DietAnswersSchema.merge(LifestyleAnswersSchema)
export type InflammationAnswers = z.infer<typeof InflammationAnswersSchema>

// Схема результата
export const InflammationResultSchema = z.object({
  diet_score: z.number().int(),
  lifestyle_score: z.number().int(),
  bmi: z.number(),
  bmi_score: z.number().int(),
  waist_score: z.number().int(),
  total_inflammation_score: z.number().int(),
  inflammation_level: InflammationLevelEnum,
  high_risk_categories: z.array(RiskCategoryEnum)
})
export type InflammationResult = z.infer<typeof InflammationResultSchema>

// Интерфейс вопроса
export interface InflammationQuestion {
  id: string
  number: number
  category: 'diet' | 'lifestyle' | 'demographics'
  subcategory?: string
  question: string
  description?: string
  type: 'radio' | 'number' | 'select'
  options?: QuestionOption[]
  validation?: {
    min?: number
    max?: number
  }
}

export interface QuestionOption {
  value: number | string
  label: string
  description?: string
}

