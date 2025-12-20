import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    const supabase = await createClient()
    let userId: string | null = null

    // Сначала пытаемся получить user_id из сессии
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('telegram_session')

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(
          Buffer.from(sessionCookie.value, 'base64').toString()
        )
        userId = sessionData.userId
      } catch {
        // Неверный формат токена, продолжаем с email
      }
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
    const { data: results, error: resultsError } = await supabase
      .from('menohub_quiz_results')
      .select('*')
      .or(`user_id.eq.${userId}${email ? `,email.eq.${email}` : ''}`)
      .order('created_at', { ascending: false })

    if (resultsError) {
      console.error('Error fetching quiz results:', resultsError)
      return NextResponse.json(
        { error: 'Не удалось загрузить результаты', details: resultsError.message },
        { status: 500 }
      )
    }

    // Ensure all required fields are present
    const formattedResults = (results || []).map((result: any) => {
      const baseResult = {
        id: result.id,
        test_type: result.test_type || 'mrs',
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
      }

      // For inflammation quiz, add additional fields from answers JSONB
      if (result.test_type === 'inflammation' && result.answers) {
        const answers = typeof result.answers === 'string' 
          ? JSON.parse(result.answers || '{}') 
          : result.answers
        
        return {
          ...baseResult,
          inflammation_level: result.severity,
          diet_score: result.vasomotor_score,
          lifestyle_score: result.psychological_score,
          bmi_score: result.urogenital_score,
          waist_score: result.somatic_score,
          bmi: answers.bmi,
          demographics: answers.demographics || {},
          high_risk_categories: answers.high_risk_categories || []
        }
      }

      return baseResult
    })

    console.log(`Found ${formattedResults.length} results for user ${userId}`)

    return NextResponse.json({
      success: true,
      results: formattedResults,
    })
  } catch (error) {
    console.error('Error in get-results API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

