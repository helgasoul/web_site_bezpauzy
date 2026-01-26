import type { MRSResult, MRSAnswer } from '@/lib/types/mrs-quiz'
import type { InflammationResult, Demographics, InflammationAnswers } from '@/lib/types/inflammation-quiz'
import type { FRAXResults, FRAXAnswers } from '@/lib/types/frax-quiz'
import type { WHRResults, WHRAnswers } from '@/lib/types/whr-quiz'
import { getMRSSeverityDescription, getMRSSeverityLabel } from '@/lib/mrs-quiz/scoring'
import { getInflammationLevelDescription, getInflammationLevelLabel } from '@/lib/inflammation-quiz/scoring'

const COMMUNITY_EMAIL_KEY = 'menohub_user_email'
const FALLBACK_EMAIL_KEY = 'user_email'
const BEZPAUZY_EMAIL_KEY = 'bezpauzy_community_email'

/**
 * Получает email пользователя из localStorage
 * Проверяет все возможные ключи для совместимости
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null
  
  // Проверяем все возможные ключи в порядке приоритета
  return localStorage.getItem(COMMUNITY_EMAIL_KEY) 
      || localStorage.getItem(FALLBACK_EMAIL_KEY)
      || localStorage.getItem(BEZPAUZY_EMAIL_KEY)
      || null
}

/**
 * Сохраняет результаты MRS квиза через API
 * Использует user_id из сессии (cookie)
 */
export async function saveMRSResults(
  result: MRSResult,
  answers: MRSAnswer
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Преобразуем данные в формат, ожидаемый API
    // Вазомоторные симптомы = hot_flashes + heart_discomfort
    const vasomotorScore = (answers.hot_flashes || 0) + (answers.heart_discomfort || 0)
    
    // Генерируем рекомендации (логика из MRSQuizResults)
    const recommendations: string[] = []
    if (result.severity === 'very_severe' || result.severity === 'severe') {
      recommendations.push('Рекомендуется консультация с гинекологом для обсуждения вариантов лечения, включая ЗГТ')
    }
    if (result.somatic_score >= 8) {
      recommendations.push('При сильных соматических симптомах (приливы, проблемы со сном) рассмотрите ЗГТ или альтернативные методы')
    }
    if (result.psychological_score >= 8) {
      recommendations.push('При выраженных психологических симптомах важны управление стрессом, достаточный сон и физическая активность')
    }
    if (result.urogenital_score >= 6) {
      recommendations.push('При урогенитальных симптомах эффективна местная (вагинальная) ЗГТ, которая обычно безопасна даже при противопоказаниях к системной ЗГТ')
    }
    if (result.severity === 'moderate') {
      recommendations.push('Немедикаментозные методы (питание, физическая активность, управление стрессом) могут помочь облегчить симптомы')
    }
    if (recommendations.length === 0) {
      recommendations.push('Продолжайте поддерживать здоровый образ жизни')
      recommendations.push('Регулярно отслеживайте изменения симптомов')
    }
    
    // Получаем описание уровня тяжести
    const severityDescription = getMRSSeverityDescription(result.severity)
    const severityLabel = getMRSSeverityLabel(result.severity)
    
    const resultsData = {
      testType: 'mrs',
      totalScore: result.total_score,
      vasomotorScore: vasomotorScore,
      psychologicalScore: result.psychological_score,
      urogenitalScore: result.urogenital_score,
      somaticScore: result.somatic_score,
      severity: result.severity === 'none' ? 'mild' : 
                result.severity === 'mild' ? 'mild' :
                result.severity === 'moderate' ? 'moderate' : 'severe',
      recommendations: recommendations,
      // Сохраняем все дополнительные данные в answers
      answers: {
        // Ответы на вопросы
        questionAnswers: Object.entries(answers).map(([key, value]) => ({
          questionId: key,
          score: value || 0
        })),
        // Объяснения и описания
        explanations: {
          severityLabel: severityLabel,
          severityDescription: severityDescription,
          categoryBreakdown: {
            somatic: {
              score: result.somatic_score,
              description: `Соматические симптомы: ${result.somatic_score} баллов (приливы, сердцебиение, сон, боли)`
            },
            psychological: {
              score: result.psychological_score,
              description: `Психологические симптомы: ${result.psychological_score} баллов (настроение, раздражительность, тревога, усталость)`
            },
            urogenital: {
              score: result.urogenital_score,
              description: `Урогенитальные симптомы: ${result.urogenital_score} баллов (половая жизнь, мочевой пузырь, сухость)`
            }
          }
        }
      }
    }

    console.log('📤 Sending MRS results to API:', {
      testType: resultsData.testType,
      totalScore: resultsData.totalScore
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важно: включаем cookies для сессии
      body: JSON.stringify({
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
      // Проверяем, требуется ли авторизация
      if (response.status === 401) {
        return { success: false, error: 'Требуется авторизация. Пожалуйста, войдите в аккаунт.' }
      }
      return { success: false, error: data.error || 'Не удалось сохранить результаты' }
    }

    return { success: true, id: data.resultId }
  } catch (error) {
    console.error('❌ Error saving MRS results:', error)
    return { success: false, error: 'Не удалось сохранить результаты' }
  }
}

/**
 * Сохраняет результаты Inflammation квиза через API
 * Использует user_id из сессии (cookie)
 */
export async function saveInflammationResults(
  result: InflammationResult,
  demographics: Demographics,
  answers: InflammationAnswers
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Преобразуем данные в формат, ожидаемый API
    // Убеждаемся, что inflammation_level соответствует допустимым значениям
    const validLevels = ['very_low', 'low', 'moderate', 'elevated', 'high']
    const inflammationLevel = validLevels.includes(result.inflammation_level) 
      ? result.inflammation_level 
      : 'moderate' // Fallback если значение невалидное
    
    console.log('🔍 Validating inflammation level:', {
      original: result.inflammation_level,
      validated: inflammationLevel,
      isValid: validLevels.includes(result.inflammation_level)
    })
    
    // Генерируем рекомендации (логика из QuizResults)
    const recommendations: string[] = []
    if (result.high_risk_categories.includes('processed_meat')) {
      recommendations.push('Сократите обработанное мясо (колбасы, сосиски) до 1 раза в неделю или реже')
    }
    if (result.high_risk_categories.includes('omega3_deficiency')) {
      recommendations.push('Добавьте жирную рыбу (лосось, скумбрия) 2-3 раза в неделю или рассмотрите добавки омега-3')
    }
    if (result.high_risk_categories.includes('sedentary')) {
      recommendations.push('Увеличьте физическую активность: начните с 30 минут ходьбы каждый день')
    }
    if (result.high_risk_categories.includes('poor_sleep')) {
      recommendations.push('Улучшите качество сна: установите режим, уберите экраны за 2 часа до сна')
    }
    if (result.high_risk_categories.includes('high_stress')) {
      recommendations.push('Добавьте практики управления стрессом: медитация, дыхательные упражнения, йога')
    }
    if (result.high_risk_categories.includes('refined_carbs')) {
      recommendations.push('Замените рафинированные углеводы на цельнозерновые: бурый рис, цельнозерновой хлеб')
    }
    if (recommendations.length === 0) {
      recommendations.push('Продолжайте поддерживать здоровые привычки!')
      recommendations.push('Добавьте больше разнообразия в растительные продукты')
      recommendations.push('Регулярно проверяйте свой индекс воспаления')
    }
    
    // Получаем описание уровня воспаления
    const levelDescription = getInflammationLevelDescription(inflammationLevel)
    const levelLabel = getInflammationLevelLabel(inflammationLevel)
    
    const resultsData = {
      testType: 'inflammation',
      totalInflammationScore: result.total_inflammation_score,
      dietScore: result.diet_score,
      lifestyleScore: result.lifestyle_score,
      bmiScore: result.bmi_score,
      waistScore: result.waist_score,
      inflammationLevel: inflammationLevel,
      bmi: result.bmi,
      demographics: demographics,
      // Сохраняем все данные в answers
      answers: {
        // Ответы на вопросы
        questionAnswers: answers,
        // Демографические данные
        demographics: demographics,
        // Объяснения и описания
        explanations: {
          levelLabel: levelLabel,
          levelDescription: levelDescription,
          scoreBreakdown: {
            diet: {
              score: result.diet_score,
              description: `Питание: ${result.diet_score > 0 ? '+' : ''}${result.diet_score} баллов`
            },
            lifestyle: {
              score: result.lifestyle_score,
              description: `Образ жизни: ${result.lifestyle_score > 0 ? '+' : ''}${result.lifestyle_score} баллов`
            },
            bmi: {
              score: result.bmi_score,
              value: result.bmi,
              description: `ИМТ: ${result.bmi.toFixed(1)} (${result.bmi_score} баллов)`
            },
            waist: {
              score: result.waist_score,
              description: result.waist_score > 0 
                ? `Окружность талии: ${result.waist_score} баллов`
                : 'Окружность талии: не указана'
            }
          },
          highRiskCategories: result.high_risk_categories
        }
      },
      highRiskCategories: result.high_risk_categories,
      recommendations: recommendations
    }

    console.log('📤 Sending inflammation results to API:', {
      testType: resultsData.testType,
      totalScore: resultsData.totalInflammationScore
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важно: включаем cookies для сессии
      body: JSON.stringify({
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
      // Проверяем, требуется ли авторизация
      if (response.status === 401) {
        return { success: false, error: 'Требуется авторизация. Пожалуйста, войдите в аккаунт.' }
      }
      return { success: false, error: data.error || 'Не удалось сохранить результаты' }
    }

    return { success: true, id: data.resultId }
  } catch (error) {
    console.error('❌ Error saving inflammation results:', error)
    return { success: false, error: 'Не удалось сохранить результаты' }
  }
}

/**
 * Сохраняет результаты FRAX квиза через API
 * Использует user_id из сессии (cookie)
 */
export async function saveFRAXResults(
  result: FRAXResults,
  answers: FRAXAnswers
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resultsData = {
      testType: 'frax',
      hipFractureRisk10y: result.hip_fracture_risk_10y,
      majorOsteoporoticFractureRisk10y: result.major_osteoporotic_fracture_risk_10y,
      riskLevel: result.risk_level,
      recommendations: result.recommendations || [],
      // Сохраняем все данные в answers
      answers: {
        // Ответы на вопросы
        questionAnswers: answers,
        // Объяснения и описания
        explanations: {
          riskLevel: result.risk_level,
          hipFractureRisk: result.hip_fracture_risk_10y,
          majorFractureRisk: result.major_osteoporotic_fracture_risk_10y,
          recommendations: result.recommendations
        }
      }
    }

    console.log('📤 Sending FRAX results to API:', {
      testType: resultsData.testType,
      riskLevel: resultsData.riskLevel
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важно: включаем cookies для сессии
      body: JSON.stringify({
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
      // Проверяем, требуется ли авторизация
      if (response.status === 401) {
        return { success: false, error: 'Требуется авторизация. Пожалуйста, войдите в аккаунт.' }
      }
      return { success: false, error: data.error || 'Не удалось сохранить результаты' }
    }

    return { success: true, id: data.resultId }
  } catch (error) {
    console.error('❌ Error saving FRAX results:', error)
    return { success: false, error: 'Не удалось сохранить результаты' }
  }
}

/**
 * Сохраняет результаты WHR квиза через API
 * Использует user_id из сессии (cookie)
 */
export async function saveWHRResults(
  result: WHRResults,
  answers: WHRAnswers
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resultsData = {
      testType: 'whr',
      bmi: result.bmi,
      whr: result.whr,
      whtr: result.whtr,
      bmiCategory: result.bmiCategory,
      whrCategory: result.whrCategory,
      whtrCategory: result.whtrCategory,
      overallRisk: result.overallRisk,
      recommendations: result.recommendations || [],
      // Сохраняем все данные в answers
      answers: {
        // Ответы на вопросы
        questionAnswers: answers,
        // Объяснения и описания
        explanations: {
          bmi: result.bmi,
          whr: result.whr,
          whtr: result.whtr,
          bmiCategory: result.bmiCategory,
          whrCategory: result.whrCategory,
          whtrCategory: result.whtrCategory,
          overallRisk: result.overallRisk,
          recommendations: result.recommendations
        }
      }
    }

    console.log('📤 Sending WHR results to API:', {
      testType: resultsData.testType,
      overallRisk: resultsData.overallRisk
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важно: включаем cookies для сессии
      body: JSON.stringify({
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
      // Проверяем, требуется ли авторизация
      if (response.status === 401) {
        return { success: false, error: 'Требуется авторизация. Пожалуйста, войдите в аккаунт.' }
      }
      return { success: false, error: data.error || 'Не удалось сохранить результаты' }
    }

    return { success: true, id: data.resultId }
  } catch (error) {
    console.error('❌ Error saving WHR results:', error)
    return { success: false, error: 'Не удалось сохранить результаты' }
  }
}

