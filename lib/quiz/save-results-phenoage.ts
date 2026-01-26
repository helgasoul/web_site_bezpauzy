/**
 * Сохраняет результаты PhenoAge квиза через API
 * Использует user_id из сессии (cookie)
 */
export async function savePhenoAgeResults(
  result: {
    phenoAge: number
    difference: number
    mortalityScore: number
    interpretation: string
  },
  formData: {
    age: number
    albumin: number
    creatinine: number
    glucose: number
    crp: number
    lymph: number
    mcv: number
    rdw: number
    alkphos: number
    wbc: number
  },
  biomarkerAnalyses: Array<{
    name: string
    value: number
    status: 'optimal' | 'normal' | 'warning' | 'danger'
    impact: string
    recommendation: string
  }>
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    // Извлекаем только нужные поля для сохранения (игнорируем color и icon - они только для UI)
    const resultData = {
      phenoAge: result.phenoAge,
      difference: result.difference,
      mortalityScore: result.mortalityScore,
      interpretation: result.interpretation,
    }

    const resultsData = {
      testType: 'phenoage',
      phenoAge: result.phenoAge,
      chronologicalAge: formData.age,
      difference: result.difference,
      mortalityScore: result.mortalityScore,
      interpretation: result.interpretation,
      // Сохраняем все данные в answers
      answers: {
        formData: formData,
        biomarkerAnalyses: biomarkerAnalyses,
        result: resultData
      }
    }

    console.log('📤 Sending PhenoAge results to API:', {
      testType: resultsData.testType,
      phenoAge: resultsData.phenoAge
    })

    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        results: resultsData
      })
    })

    const data = await response.json()

    console.log('📥 API response:', { status: response.status, ok: response.ok, data })

    if (!response.ok) {
      console.error('❌ API error:', data)
      if (response.status === 401) {
        return { success: false, error: 'Требуется авторизация. Пожалуйста, войдите в аккаунт.' }
      }
      return { success: false, error: data.error || 'Не удалось сохранить результаты' }
    }

    return { success: true, id: data.resultId }
  } catch (error) {
    console.error('❌ Error saving PhenoAge results:', error)
    return { success: false, error: 'Не удалось сохранить результаты' }
  }
}

