import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, results } = await request.json()

    console.log('📥 Received save request:', { email, testType: results?.testType, hasTotalScore: !!results?.totalScore })

    if (!email || !results) {
      return NextResponse.json(
        { error: 'Email и результаты обязательны' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user exists in community_members
    const { data: existingUser, error: userError } = await supabase
      .from('menohub_community_members')
      .select('id')
      .eq('email', email)
      .maybeSingle() // Use maybeSingle instead of single to avoid error if not found

    let userId: string | null = null

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking user:', userError)
      return NextResponse.json(
        { error: 'Ошибка при проверке пользователя', details: userError.message },
        { status: 500 }
      )
    }

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new community member
      const { data: newUser, error: createError } = await supabase
        .from('menohub_community_members')
        .insert({
          email,
          name: email.split('@')[0], // Use email prefix as default name
          status: 'active',
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Не удалось создать пользователя', details: createError.message },
          { status: 500 }
        )
      }

      if (!newUser) {
        return NextResponse.json(
          { error: 'Не удалось создать пользователя: нет данных' },
          { status: 500 }
        )
      }

      userId = newUser.id
    }

    // Determine test type from results structure
    const testType = results.testType || (results.totalScore !== undefined ? 'mrs' : 'inflammation')
    
    console.log('🔍 Determined test type:', testType)
    console.log('📊 Results structure:', {
      hasTestType: !!results.testType,
      hasTotalScore: results.totalScore !== undefined,
      hasTotalInflammationScore: results.totalInflammationScore !== undefined,
      keys: Object.keys(results)
    })
    console.log('👤 User ID:', userId)
    
    // Save quiz results
    let savedResult
    let saveError
    
    if (testType === 'inflammation') {
      // Save inflammation quiz results
      // Map inflammation level to severity (must match database CHECK constraint)
      // Valid values: 'very_low', 'low', 'moderate', 'elevated', 'high'
      const validSeverityValues = ['very_low', 'low', 'moderate', 'elevated', 'high', 'mild', 'severe']
      const inflammationLevel = results.inflammationLevel || 'moderate'
      const severity = validSeverityValues.includes(inflammationLevel) 
        ? inflammationLevel 
        : 'moderate' // Fallback to valid value
      
      console.log('🔍 Inflammation level mapping:', { 
        received: results.inflammationLevel,
        inflammationLevel, 
        severity,
        isValid: validSeverityValues.includes(inflammationLevel)
      })
      
      if (!validSeverityValues.includes(severity)) {
        console.error('❌ Invalid severity value:', severity)
        return NextResponse.json(
          { error: `Недопустимое значение severity: ${severity}. Допустимые: ${validSeverityValues.join(', ')}` },
          { status: 400 }
        )
      }
      
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert({
          user_id: userId,
          email,
          test_type: 'inflammation',
          total_score: results.totalInflammationScore || 0,
          vasomotor_score: results.dietScore || 0,
          psychological_score: results.lifestyleScore || 0,
          urogenital_score: results.bmiScore || 0,
          somatic_score: results.waistScore || 0,
          severity: severity,
          recommendations: Array.isArray(results.recommendations) ? results.recommendations : [],
          answers: {
            demographics: results.demographics || {},
            answers: results.answers || {},
            bmi: results.bmi,
            high_risk_categories: results.highRiskCategories || []
          },
        })
        .select('id')
        .single()
      savedResult = data
      saveError = error
    } else {
      // Save MRS quiz results (existing logic)
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert({
          user_id: userId,
          email,
          test_type: 'mrs',
          total_score: results.totalScore,
          vasomotor_score: results.vasomotorScore,
          psychological_score: results.psychologicalScore,
          urogenital_score: results.urogenitalScore,
          somatic_score: results.somaticScore,
          severity: results.severity,
          recommendations: Array.isArray(results.recommendations) ? results.recommendations : [],
          answers: Array.isArray(results.answers) ? results.answers : [],
        })
        .select('id')
        .single()
      savedResult = data
      saveError = error
    }

    if (saveError) {
      console.error('❌ Error saving quiz results:', saveError)
      console.error('Error details:', JSON.stringify(saveError, null, 2))
      return NextResponse.json(
        { error: 'Не удалось сохранить результаты', details: saveError.message },
        { status: 500 }
      )
    }

    if (!savedResult || !savedResult.id) {
      console.error('❌ No result ID returned from insert')
      console.error('Saved result:', savedResult)
      return NextResponse.json(
        { error: 'Не удалось сохранить результаты: нет ID результата' },
        { status: 500 }
      )
    }

    console.log('✅ Successfully saved quiz result:', savedResult.id)

    // Store email in response for client-side use
    return NextResponse.json({
      success: true,
      resultId: savedResult.id,
      email,
      message: 'Результаты успешно сохранены',
    })
  } catch (error) {
    console.error('Error in save-results API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

