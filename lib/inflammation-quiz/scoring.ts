import type { 
  Demographics, 
  InflammationAnswers, 
  InflammationResult, 
  InflammationLevel,
  RiskCategory 
} from '@/lib/types/inflammation-quiz'

/**
 * Рассчитывает индекс воспаления
 */
export function calculateInflammationScore(
  demographics: Demographics,
  answers: InflammationAnswers
): InflammationResult {
  // 1. Diet score (сумма всех diet_ вопросов)
  const diet_score = 
    answers.diet_leafy_greens +
    answers.diet_berries +
    answers.diet_fatty_fish +
    answers.diet_nuts +
    answers.diet_olive_oil +
    answers.diet_whole_grains +
    answers.diet_legumes +
    answers.diet_turmeric_spices +
    answers.diet_processed_meat +
    answers.diet_red_meat +
    answers.diet_refined_carbs +
    answers.diet_sugary_drinks +
    answers.diet_fried_foods +
    answers.diet_alcohol +
    answers.diet_trans_fats
  
  // 2. Lifestyle score
  const lifestyle_score = 
    answers.lifestyle_physical_activity +
    answers.lifestyle_sleep_duration +
    answers.lifestyle_sleep_quality +
    answers.lifestyle_stress_level +
    answers.lifestyle_smoking +
    answers.lifestyle_sitting_time +
    answers.lifestyle_stress_management
  
  // 3. BMI calculation
  const height_m = demographics.height_cm / 100
  const bmi = demographics.weight_kg / (height_m * height_m)
  
  // 4. BMI score
  const bmi_score = calculateBMIScore(bmi)
  
  // 5. Waist circumference score
  const waist_score = calculateWaistScore(demographics.waist_circumference_cm)
  
  // 6. Total inflammation score
  const total_inflammation_score = 
    diet_score + 
    lifestyle_score + 
    bmi_score + 
    waist_score
  
  // 7. Inflammation level
  const inflammation_level = determineInflammationLevel(total_inflammation_score)
  
  // 8. High risk categories
  const high_risk_categories = identifyRiskCategories(
    demographics,
    answers,
    bmi,
    demographics.waist_circumference_cm
  )
  
  return {
    diet_score,
    lifestyle_score,
    bmi,
    bmi_score,
    waist_score,
    total_inflammation_score,
    inflammation_level,
    high_risk_categories
  }
}

/**
 * Рассчитывает баллы за ИМТ
 */
function calculateBMIScore(bmi: number): number {
  if (bmi >= 30) return 3 // ожирение
  if (bmi >= 27) return 2 // избыточный вес
  if (bmi >= 25) return 1 // небольшой избыток
  if (bmi >= 18.5) return 0 // норма
  return 1 // недостаточный вес
}

/**
 * Рассчитывает баллы за окружность талии
 */
function calculateWaistScore(waist_cm?: number): number {
  if (!waist_cm) return 0
  if (waist_cm >= 88) return 2 // абдоминальное ожирение
  if (waist_cm >= 80) return 1 // риск
  return 0 // норма
}

/**
 * Определяет уровень воспаления
 */
function determineInflammationLevel(total_score: number): InflammationLevel {
  if (total_score <= -10) return 'very_low'
  if (total_score <= 0) return 'low'
  if (total_score <= 10) return 'moderate'
  if (total_score <= 20) return 'elevated'
  return 'high'
}

/**
 * Идентифицирует категории высокого риска
 */
function identifyRiskCategories(
  demographics: Demographics,
  answers: InflammationAnswers,
  bmi: number,
  waist_cm?: number
): RiskCategory[] {
  const risks: RiskCategory[] = []
  
  // Diet-related risks
  if (answers.diet_processed_meat >= 2) risks.push('processed_meat')
  if (answers.diet_refined_carbs >= 2) risks.push('refined_carbs')
  if (answers.diet_fatty_fish <= 0) risks.push('omega3_deficiency')
  if (answers.diet_whole_grains <= 0 && answers.diet_legumes <= 0) risks.push('low_fiber')
  if (answers.diet_alcohol >= 2) risks.push('excessive_alcohol')
  
  // Lifestyle risks
  if (answers.lifestyle_physical_activity >= 1) risks.push('sedentary')
  if (answers.lifestyle_sleep_duration >= 1 || answers.lifestyle_sleep_quality >= 1) {
    risks.push('poor_sleep')
  }
  if (answers.lifestyle_stress_level >= 2) risks.push('high_stress')
  if (answers.lifestyle_smoking >= 1) risks.push('smoking')
  
  // Body composition risks
  if (bmi >= 30) risks.push('obesity')
  if (waist_cm && waist_cm >= 88) risks.push('abdominal_obesity')
  
  return risks
}

/**
 * Получить label для уровня воспаления
 */
export function getInflammationLevelLabel(level: InflammationLevel): string {
  const labels: Record<InflammationLevel, string> = {
    very_low: 'Очень низкий уровень воспаления',
    low: 'Низкий уровень воспаления',
    moderate: 'Умеренный уровень воспаления',
    elevated: 'Повышенный уровень воспаления',
    high: 'Высокий уровень воспаления'
  }
  return labels[level]
}

/**
 * Получить описание уровня воспаления
 */
export function getInflammationLevelDescription(level: InflammationLevel): string {
  const descriptions: Record<InflammationLevel, string> = {
    very_low: 'Отличная работа! Ваш образ жизни и питание оказывают сильный противовоспалительный эффект. Хроническое воспаление минимально, что снижает риск сердечно-сосудистых заболеваний, диабета 2 типа и других возрастных заболеваний. Продолжайте в том же духе!',
    low: 'Хорошие результаты! Ваши привычки в целом поддерживают низкий уровень воспаления. Есть небольшие области для улучшения, которые могут дать дополнительную пользу, особенно в контексте менопаузы.',
    moderate: 'Умеренный уровень воспаления означает, что есть значительные возможности для улучшения. Хроническое воспаление на этом уровне может усиливать симптомы менопаузы и повышать риск возрастных заболеваний. Хорошая новость: изменения в питании и образе жизни могут быстро дать результаты.',
    elevated: 'Повышенный уровень воспаления требует внимания. Ваш текущий образ жизни способствует хроническому воспалению, что может ухудшать симптомы менопаузы (приливы, боли в суставах, проблемы со сном) и повышать риск серьёзных заболеваний. Рекомендуются значительные изменения.',
    high: 'Высокий уровень воспаления - серьёзный фактор риска для здоровья. На этом уровне хроническое воспаление связано с повышенным риском сердечно-сосудистых заболеваний, диабета, остеопороза и когнитивных нарушений. Настоятельно рекомендуется консультация с врачом и комплексные изменения образа жизни.'
  }
  return descriptions[level]
}

/**
 * Получить цвет для уровня
 */
export function getInflammationLevelColor(level: InflammationLevel): string {
  const colors: Record<InflammationLevel, string> = {
    very_low: 'from-success/20 to-success/10',
    low: 'from-ocean-wave-start/20 to-ocean-wave-end/10',
    moderate: 'from-warning/20 to-warning/10',
    elevated: 'from-warm-accent/20 to-warm-accent/10',
    high: 'from-error/20 to-error/10'
  }
  return colors[level]
}

/**
 * Получить emoji для уровня
 */
export function getInflammationLevelEmoji(level: InflammationLevel): string {
  const emojis: Record<InflammationLevel, string> = {
    very_low: '🌟',
    low: '✅',
    moderate: '⚠️',
    elevated: '🔶',
    high: '🔴'
  }
  return emojis[level]
}

