import type { WHRAnswers, WHRResults } from '@/lib/types/whr-quiz'

/**
 * Рассчитывает ИМТ (BMI)
 */
function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

/**
 * Определяет категорию ИМТ
 */
function getBMICategory(bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

/**
 * Рассчитывает WHR (Waist-to-Hip Ratio)
 */
function calculateWHR(waist: number, hip: number): number {
  return waist / hip
}

/**
 * Определяет категорию WHR для женщин
 * Норма для женщин: < 0.85
 */
function getWHRCategory(whr: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (whr < 0.80) return 'low'
  if (whr < 0.85) return 'moderate'
  if (whr < 0.90) return 'high'
  return 'very_high'
}

/**
 * Рассчитывает WHtR (Waist-to-Height Ratio)
 */
function calculateWHtR(waist: number, height: number): number {
  return waist / height
}

/**
 * Определяет категорию WHtR
 * Норма: < 0.5
 */
function getWHtRCategory(whtr: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (whtr < 0.4) return 'low'
  if (whtr < 0.5) return 'moderate'
  if (whtr < 0.6) return 'high'
  return 'very_high'
}

/**
 * Маппинг категорий BMI к категориям риска
 */
function mapBMIToRiskCategory(bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese'): 'low' | 'moderate' | 'high' | 'very_high' {
  switch (bmiCategory) {
    case 'underweight':
      return 'low'
    case 'normal':
      return 'low'
    case 'overweight':
      return 'moderate'
    case 'obese':
      return 'high'
    default:
      return 'moderate'
  }
}

/**
 * Определяет общий риск метаболических нарушений
 */
function calculateOverallRisk(
  bmiCategory: WHRResults['bmiCategory'],
  whrCategory: WHRResults['whrCategory'],
  whtrCategory: WHRResults['whtrCategory']
): 'low' | 'moderate' | 'high' | 'very_high' {
  const riskScores = {
    low: 1,
    moderate: 2,
    high: 3,
    very_high: 4,
  }

  const bmiRiskCategory = mapBMIToRiskCategory(bmiCategory)
  const bmiScore = riskScores[bmiRiskCategory]
  const whrScore = riskScores[whrCategory]
  const whtrScore = riskScores[whtrCategory]

  const averageScore = (bmiScore + whrScore + whtrScore) / 3

  if (averageScore < 1.5) return 'low'
  if (averageScore < 2.5) return 'moderate'
  if (averageScore < 3.5) return 'high'
  return 'very_high'
}

/**
 * Генерирует рекомендации на основе результатов
 */
function generateRecommendations(results: Omit<WHRResults, 'recommendations'>): string[] {
  const recommendations: string[] = []

  // Рекомендации по ИМТ
  if (results.bmiCategory === 'underweight') {
    recommendations.push('Ваш ИМТ ниже нормы. Рекомендуется консультация с врачом для оценки состояния здоровья')
  } else if (results.bmiCategory === 'normal') {
    recommendations.push('Ваш ИМТ в пределах нормы. Продолжайте поддерживать здоровый образ жизни')
  } else if (results.bmiCategory === 'overweight') {
    recommendations.push('Ваш ИМТ указывает на избыточный вес. Рекомендуется снижение веса на 5-10% для улучшения метаболического здоровья')
  } else {
    recommendations.push('Ваш ИМТ указывает на ожирение. Рекомендуется консультация с врачом и диетологом для разработки плана снижения веса')
  }

  // Рекомендации по WHR
  if (results.whrCategory === 'high' || results.whrCategory === 'very_high') {
    recommendations.push('Высокое соотношение талии и бёдер указывает на абдоминальное ожирение, которое связано с повышенным риском сердечно-сосудистых заболеваний и диабета')
    recommendations.push('Сфокусируйтесь на снижении веса, особенно жира в области живота, через сочетание диеты и физических упражнений')
  } else if (results.whrCategory === 'moderate') {
    recommendations.push('Соотношение талии и бёдер в допустимом диапазоне. Продолжайте поддерживать здоровый образ жизни')
  }

  // Рекомендации по WHtR
  if (results.whtrCategory === 'high' || results.whtrCategory === 'very_high') {
    recommendations.push('Высокое соотношение талии и роста указывает на повышенный метаболический риск')
    recommendations.push('Рекомендуется регулярная физическая активность (минимум 150 минут в неделю умеренной интенсивности) и сбалансированное питание')
  } else {
    recommendations.push('Соотношение талии и роста в норме. Поддерживайте текущий образ жизни')
  }

  // Общие рекомендации
  if (results.overallRisk === 'high' || results.overallRisk === 'very_high') {
    recommendations.push('Рекомендуется регулярный мониторинг показателей здоровья: контроль артериального давления, уровня сахара и холестерина в крови')
    recommendations.push('Рассмотрите консультацию с врачом-эндокринологом или диетологом для персонализированных рекомендаций')
  }

  // Рекомендации для менопаузы
  recommendations.push('В период менопаузы особенно важно поддерживать здоровый вес и физическую активность для снижения рисков метаболических нарушений')

  return recommendations.slice(0, 6) // Ограничиваем до 6 рекомендаций
}

/**
 * Основная функция расчета результатов WHR квиза
 */
export function calculateWHRScore(answers: WHRAnswers): WHRResults {
  const bmi = calculateBMI(answers.weight, answers.height)
  const bmiCategory = getBMICategory(bmi)

  const whr = calculateWHR(answers.waist, answers.hip)
  const whrCategory = getWHRCategory(whr)

  const whtr = calculateWHtR(answers.waist, answers.height)
  const whtrCategory = getWHtRCategory(whtr)

  const overallRisk = calculateOverallRisk(bmiCategory, whrCategory, whtrCategory)

  const partialResults: Omit<WHRResults, 'recommendations'> = {
    bmi,
    whr,
    whtr,
    bmiCategory,
    whrCategory,
    whtrCategory,
    overallRisk,
  }

  const recommendations = generateRecommendations(partialResults)

  return {
    ...partialResults,
    recommendations,
  }
}

/**
 * Получает текстовое описание категории риска
 */
export function getRiskLabel(risk: WHRResults['overallRisk']): string {
  const labels = {
    low: 'Низкий риск',
    moderate: 'Умеренный риск',
    high: 'Высокий риск',
    very_high: 'Очень высокий риск',
  }
  return labels[risk]
}

/**
 * Получает цвет для категории риска
 */
export function getRiskColor(risk: WHRResults['overallRisk']): string {
  const colors = {
    low: 'from-success/20 to-success/10',
    moderate: 'from-warm-accent/20 to-warm-accent/10',
    high: 'from-error/20 to-error/10',
    very_high: 'from-error/30 to-error/20',
  }
  return colors[risk]
}

/**
 * Получает эмодзи для категории риска
 */
export function getRiskEmoji(risk: WHRResults['overallRisk']): string {
  const emojis = {
    low: '✅',
    moderate: '⚠️',
    high: '🔴',
    very_high: '🚨',
  }
  return emojis[risk]
}

