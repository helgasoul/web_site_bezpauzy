/**
 * Zod schemas for quiz results validation
 */

import { z } from 'zod'

// Базовые схемы для разных типов тестов
const baseQuizResultSchema = z.object({
  testType: z.enum(['mrs', 'menopause_stage', 'inflammation', 'phenoage', 'frax', 'whr']).optional(),
})

// MRS (Menopause Rating Scale)
const mrsResultSchema = baseQuizResultSchema.extend({
  testType: z.literal('mrs').optional(),
  totalScore: z.number().min(0).max(44),
  vasomotorScore: z.number().min(0).max(8).optional(),
  psychologicalScore: z.number().min(0).max(16).optional(),
  urogenitalScore: z.number().min(0).max(12).optional(),
  somaticScore: z.number().min(0).max(8).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'very_severe']).optional(),
  recommendations: z.array(z.string()).optional(),
  answers: z.any().optional(), // Сложная структура, валидируем как any
})

// Inflammation
const inflammationResultSchema = baseQuizResultSchema.extend({
  testType: z.literal('inflammation').optional(),
  totalInflammationScore: z.number().min(0),
  inflammationLevel: z.enum(['very_low', 'low', 'moderate', 'elevated', 'high', 'mild', 'severe']).optional(),
  dietScore: z.number().min(0).optional(),
  lifestyleScore: z.number().min(0).optional(),
  bmiScore: z.number().min(0).optional(),
  waistScore: z.number().min(0).optional(),
  recommendations: z.array(z.string()).optional(),
  answers: z.any().optional(),
  highRiskCategories: z.array(z.string()).optional(),
})

// PhenoAge
const phenoageResultSchema = baseQuizResultSchema.extend({
  testType: z.literal('phenoage').optional(),
  phenoAge: z.number().min(0).max(150),
  chronologicalAge: z.number().min(0).max(150).optional(),
  difference: z.number().optional(),
  mortalityScore: z.number().min(0).max(1).optional(),
  interpretation: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  answers: z.any().optional(),
})

// FRAX
const fraxResultSchema = baseQuizResultSchema.extend({
  testType: z.literal('frax').optional(),
  hipFractureRisk10y: z.number().min(0).max(100),
  majorOsteoporoticFractureRisk10y: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'moderate', 'high']).optional(),
  recommendations: z.array(z.string()).optional(),
  answers: z.any().optional(),
})

// WHR (Waist-to-Hip Ratio)
const whrResultSchema = baseQuizResultSchema.extend({
  testType: z.literal('whr').optional(),
  bmi: z.number().min(0).max(100).optional(),
  whr: z.number().min(0).max(5).optional(),
  whtr: z.number().min(0).max(2).optional(),
  bmiCategory: z.string().optional(),
  whrCategory: z.string().optional(),
  whtrCategory: z.string().optional(),
  overallRisk: z.enum(['low', 'moderate', 'high', 'very_high']).optional(),
  recommendations: z.array(z.string()).optional(),
  answers: z.any().optional(),
})

// Объединенная схема - проверяем по testType или по наличию специфичных полей
export const quizResultsSchema = z.union([
  mrsResultSchema,
  inflammationResultSchema,
  phenoageResultSchema,
  fraxResultSchema,
  whrResultSchema,
]).refine(
  (data) => {
    // Если testType указан явно, проверяем соответствие
    if (data.testType) {
      return true
    }
    
    // Иначе проверяем наличие специфичных полей
    if ('totalInflammationScore' in data) return true
    if ('phenoAge' in data) return true
    if ('hipFractureRisk10y' in data || 'majorOsteoporoticFractureRisk10y' in data) return true
    if ('bmi' in data || 'whr' in data || 'whtr' in data) return true
    if ('totalScore' in data) return true
    
    return false
  },
  {
    message: 'Не удалось определить тип теста. Укажите testType или предоставьте данные для одного из типов тестов.',
  }
)

