import { z } from 'zod'

// MRS Quiz Types
export const MRSSeverityEnum = z.enum([
  'none',
  'mild',
  'moderate',
  'severe',
  'very_severe'
])
export type MRSSeverity = z.infer<typeof MRSSeverityEnum>

// MRS Questions (11 questions, each scored 0-4)
export const MRSAnswerSchema = z.object({
  hot_flashes: z.number().int().min(0).max(4),
  heart_discomfort: z.number().int().min(0).max(4),
  sleep_problems: z.number().int().min(0).max(4),
  depressive_mood: z.number().int().min(0).max(4),
  irritability: z.number().int().min(0).max(4),
  anxiety: z.number().int().min(0).max(4),
  physical_mental_exhaustion: z.number().int().min(0).max(4),
  sexual_problems: z.number().int().min(0).max(4),
  bladder_problems: z.number().int().min(0).max(4),
  vaginal_dryness: z.number().int().min(0).max(4),
  joint_muscle_pain: z.number().int().min(0).max(4)
})
export type MRSAnswer = z.infer<typeof MRSAnswerSchema>

// MRS Result
export const MRSResultSchema = z.object({
  total_score: z.number().int().min(0).max(44),
  severity: MRSSeverityEnum,
  somatic_score: z.number().int(), // hot_flashes + heart_discomfort + sleep_problems + joint_muscle_pain
  psychological_score: z.number().int(), // depressive_mood + irritability + anxiety + physical_mental_exhaustion
  urogenital_score: z.number().int() // sexual_problems + bladder_problems + vaginal_dryness
})
export type MRSResult = z.infer<typeof MRSResultSchema>

// MRS Question interface
export interface MRSQuestion {
  id: keyof MRSAnswer
  number: number
  question: string
  description?: string
  category: 'somatic' | 'psychological' | 'urogenital'
}

