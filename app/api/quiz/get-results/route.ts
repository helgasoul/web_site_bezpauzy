import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    const supabase = await createClient()
    let userId: number | string | null = null

    // Сначала пытаемся получить user_id из сессии через безопасную JWT проверку
    const sessionData = await getSession()
    if (sessionData) {
      userId = sessionData.userId
    }

    // Если нет сессии, но есть email, ищем пользователя по email
    if (!userId && email) {
      // Сначала проверяем в menohub_users
      const { data: userFromUsers, error: userFromUsersError } = await supabase
        .from('menohub_users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (userFromUsers && !userFromUsersError) {
        // userFromUsers.id уже правильного типа (BIGINT из базы)
        userId = userFromUsers.id
      } else {
        // Если не нашли в menohub_users, проверяем в menohub_community_members (для обратной совместимости)
        const { data: userFromCommunity, error: userFromCommunityError } = await supabase
          .from('menohub_community_members')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (userFromCommunity && !userFromCommunityError) {
          userId = userFromCommunity.id
        }
      }
    }

    if (!userId) {
      // Если нет ни сессии, ни email, или пользователь не найден
      if (!email) {
        return NextResponse.json(
          { error: 'Необходимо войти в аккаунт или указать email' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { results: [] },
        { status: 200 }
      )
    }

    // Get quiz results for this user
    // Ищем результаты по user_id из menohub_users или по email (для обратной совместимости)
    // После миграции user_id будет BIGINT, поэтому используем правильный тип
    let query = supabase
      .from('menohub_quiz_results')
      .select('*')
    
    if (userId) {
      // Используем eq с числовым значением для правильной работы с BIGINT
      query = query.eq('user_id', userId)
    }
    
    if (email) {
      // Добавляем поиск по email как альтернативу
      if (userId) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`)
      } else {
        query = query.eq('email', email)
      }
    }
    
    const { data: results, error: resultsError } = await query
      .order('created_at', { ascending: false })

    if (resultsError) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching quiz results:', resultsError)
      }
      return NextResponse.json(
        {
          error: 'Не удалось загрузить результаты',
          ...(process.env.NODE_ENV === 'development' && { details: resultsError.message }),
        },
        { status: 500 }
      )
    }

    // Ensure all required fields are present
    const formattedResults = (results || []).map((result: any) => {
      // Парсим answers JSONB
      const answers = typeof result.answers === 'string' 
        ? JSON.parse(result.answers || '{}') 
        : (result.answers || {})
      
      // Определяем test_type более точно: используем значение из БД, если оно есть
      // Если нет, определяем по структуре данных
      let testType = result.test_type
      if (!testType) {
        // Попытка определить тип по структуре данных
        // ВАЖНО: Сначала проверяем специфичные поля для каждого типа квиза
        const answers = typeof result.answers === 'string' 
          ? JSON.parse(result.answers || '{}') 
          : (result.answers || {})
        
        // Проверка на FRAX: специфичные поля hipFractureRisk10y или majorOsteoporoticFractureRisk10y
        if (answers.hipFractureRisk10y !== undefined || 
            answers.majorOsteoporoticFractureRisk10y !== undefined ||
            answers.hip_fracture_risk_10y !== undefined ||
            answers.major_osteoporotic_fracture_risk_10y !== undefined) {
          testType = 'frax'
        }
        // Проверка на PhenoAge: специфичное поле phenoAge
        else if (answers.phenoAge !== undefined || answers.pheno_age !== undefined) {
          testType = 'phenoage'
        }
        // Проверка на MRS: наличие специфичных полей somatic_score, psychological_score, urogenital_score
        else if (result.somatic_score !== undefined && 
                 result.psychological_score !== undefined && 
                 result.urogenital_score !== undefined) {
          testType = 'mrs'
        }
        // Проверка на Inflammation: специфичные поля diet_score, lifestyle_score
        else if (result.diet_score !== undefined || result.lifestyle_score !== undefined) {
          testType = 'inflammation'
        }
        // По умолчанию только если ничего не определено
        else {
          testType = 'mrs'
        }
      }
      
      const baseResult = {
        id: result.id,
        test_type: testType,
        total_score: result.total_score || 0,
        vasomotor_score: result.vasomotor_score || 0,
        psychological_score: result.psychological_score || 0,
        urogenital_score: result.urogenital_score || 0,
        somatic_score: result.somatic_score || 0,
        severity: result.severity || 'mild',
        recommendations: Array.isArray(result.recommendations) 
          ? result.recommendations 
          : (typeof result.recommendations === 'string' 
            ? JSON.parse(result.recommendations || '[]') 
            : []),
        created_at: result.created_at,
        // Включаем все данные из answers (объяснения, описания и т.д.)
        answers: answers,
      }

      // For inflammation quiz, add additional fields from answers JSONB
      if (result.test_type === 'inflammation') {
        // Извлекаем данные из answers.explanations если они есть
        const explanations = answers.explanations || {}
        const questionAnswers = answers.questionAnswers || answers.answers || {}
        const demographics = answers.demographics || answers.demographics || {}
        
        return {
          ...baseResult,
          inflammation_level: result.severity,
          diet_score: result.vasomotor_score,
          lifestyle_score: result.psychological_score,
          bmi_score: result.urogenital_score,
          waist_score: result.somatic_score,
          bmi: answers.bmi || explanations.scoreBreakdown?.bmi?.value || null,
          demographics: demographics,
          high_risk_categories: answers.high_risk_categories || explanations.highRiskCategories || [],
          // Используем рекомендации из explanations если они есть, иначе из baseResult
          recommendations: baseResult.recommendations.length > 0 
            ? baseResult.recommendations 
            : (explanations.recommendations || []),
          // Сохраняем все объяснения
          explanations: explanations,
        }
      }

      // For MRS quiz, extract explanations from answers
      if (result.test_type === 'mrs' && answers.explanations) {
        return {
          ...baseResult,
          explanations: answers.explanations,
          // Используем рекомендации из explanations если они есть
          recommendations: baseResult.recommendations.length > 0 
            ? baseResult.recommendations 
            : (answers.explanations.recommendations || []),
        }
      }

      return baseResult
    })

    // Логируем только в development (без userId)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${formattedResults.length} results`)
    }

    return NextResponse.json({
      success: true,
      results: formattedResults,
    })
  } catch (error) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in get-results API:', error)
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

