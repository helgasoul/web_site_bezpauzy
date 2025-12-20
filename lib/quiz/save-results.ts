import type { MRSResult, MRSAnswer } from '@/lib/types/mrs-quiz'
import type { InflammationResult, Demographics, InflammationAnswers } from '@/lib/types/inflammation-quiz'

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
 */
export async function saveMRSResults(
  result: MRSResult,
  answers: MRSAnswer
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const email = getUserEmail()
    
    if (!email) {
      return { success: false, error: 'Необходимо войти в аккаунт для сохранения результатов' }
    }

    // Преобразуем данные в формат, ожидаемый API
    // Вазомоторные симптомы = hot_flashes + heart_discomfort
    const vasomotorScore = (answers.hot_flashes || 0) + (answers.heart_discomfort || 0)
    
    const resultsData = {
      totalScore: result.total_mrs_score,
      vasomotorScore: vasomotorScore,
      psychologicalScore: result.psychological_score,
      urogenitalScore: result.urogenital_score,
      somaticScore: result.somatic_score,
      severity: result.mrs_level === 'no_symptoms' ? 'mild' : 
                result.mrs_level === 'mild' ? 'mild' :
                result.mrs_level === 'moderate' ? 'moderate' : 'severe',
      recommendations: [], // Можно добавить генерацию рекомендаций
      answers: Object.entries(answers).map(([key, value]) => ({
        questionId: key,
        score: value || 0
      }))
    }

    console.log('📤 Sending MRS results to API:', {
      email,
      totalScore: resultsData.totalScore
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
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
 */
export async function saveInflammationResults(
  result: InflammationResult,
  demographics: Demographics,
  answers: InflammationAnswers
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const email = getUserEmail()
    
    if (!email) {
      return { success: false, error: 'Необходимо войти в аккаунт для сохранения результатов' }
    }

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
      answers: answers,
      highRiskCategories: result.high_risk_categories,
      recommendations: [] // Можно добавить генерацию рекомендаций
    }

    console.log('📤 Sending inflammation results to API:', {
      email,
      testType: resultsData.testType,
      totalScore: resultsData.totalInflammationScore
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
      return { success: false, error: data.error || 'Не удалось сохранить результаты' }
    }

    return { success: true, id: data.resultId }
  } catch (error) {
    console.error('❌ Error saving inflammation results:', error)
    return { success: false, error: 'Не удалось сохранить результаты' }
  }
}

