import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { z } from 'zod'
import { quizResultsSchema } from '@/lib/validation/quiz'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация входных данных с помощью Zod
    const validationResult = quizResultsSchema.safeParse(body.results || body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Неверные данные результатов теста',
          details: validationResult.error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    const results = validationResult.data

    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('📥 Received save request:', { testType: results?.testType })
    }

    const supabase = await createClient()

    // Проверяем сессию пользователя через безопасную JWT проверку
    const sessionData = await getSession()

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Требуется авторизация. Пожалуйста, войдите в аккаунт для сохранения результатов.' },
        { status: 401 }
      )
    }

    // Преобразуем userId в правильный тип (BIGINT для menohub_users.id)
    // В TypeScript используем number, который поддерживает значения до 2^53-1 (безопасно для BIGINT)
    const userId: number = sessionData.userId

    if (!userId || userId <= 0 || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Неверный ID пользователя. Пожалуйста, войдите в аккаунт снова.' },
        { status: 401 }
      )
    }

    // Логируем только в development (без userId)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('👤 User ID converted successfully')
    }

    // Проверяем, что пользователь существует
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id, username')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error checking user:', userError?.message)
      }
      return NextResponse.json(
        { error: 'Пользователь не найден. Пожалуйста, войдите в аккаунт снова.' },
        { status: 401 }
      )
    }

    const userEmail = null // Email не используется в таблице menohub_users

    // Определяем тип теста (валидация уже прошла через Zod)
    // Приоритет: явно указанный testType > наличие специфичных полей для каждого типа
    let testType: string
    if (results.testType) {
      testType = results.testType
    } else if ('phenoAge' in results && results.phenoAge !== undefined) {
      testType = 'phenoage'
    } else if ('totalInflammationScore' in results && results.totalInflammationScore !== undefined) {
      testType = 'inflammation'
    } else if ('bmi' in results || 'whr' in results || 'whtr' in results) {
      testType = 'whr'
    } else if ('hipFractureRisk10y' in results || 'majorOsteoporoticFractureRisk10y' in results) {
      testType = 'frax'
    } else if ('totalScore' in results && results.totalScore !== undefined) {
      testType = 'mrs'
    } else {
      // Это не должно произойти, так как Zod уже проверил данные
      return NextResponse.json(
        { error: 'Не удалось определить тип теста. Пожалуйста, укажите testType в данных.' },
        { status: 400 }
      )
    }
    
    // Логируем только в development (без чувствительных данных)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🔍 Determined test type:', testType)
    }
    
    // Save quiz results
    let savedResult
    let saveError
    
    if (testType === 'inflammation') {
      // Save inflammation quiz results
      // Map inflammation level to severity (must match database CHECK constraint)
      // Valid values: 'very_low', 'low', 'moderate', 'elevated', 'high'
      const validSeverityValues = ['very_low', 'low', 'moderate', 'elevated', 'high', 'mild', 'severe']
      // Type guard: проверяем, что это inflammation результат
      // Используем проверку наличия поля totalInflammationScore для type narrowing
      if (!('totalInflammationScore' in results)) {
        return NextResponse.json(
          { error: 'Отсутствуют данные результатов теста на воспаление' },
          { status: 400 }
        )
      }
      // Теперь TypeScript знает, что это inflammation результат
      const inflammationResults = results as { 
        inflammationLevel?: string
        totalInflammationScore?: number
        [key: string]: any
      }
      const inflammationLevel = (inflammationResults.inflammationLevel || 'moderate') as string
      const severity = validSeverityValues.includes(inflammationLevel) 
        ? inflammationLevel 
        : 'moderate' // Fallback to valid value
      
      // Логируем только в development (без чувствительных данных)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('🔍 Inflammation level mapping completed')
      }
      
      if (!validSeverityValues.includes(severity)) {
        // Логируем только в development
        if (process.env.NODE_ENV === 'development') {
          logger.error('❌ Invalid severity value')
        }
        return NextResponse.json(
          { error: `Недопустимое значение severity: ${severity}. Допустимые: ${validSeverityValues.join(', ')}` },
          { status: 400 }
        )
      }
      
      const insertData = {
        user_id: userId,
        email: userEmail,
        test_type: 'inflammation' as const, // Явно указываем тип
        total_score: results.totalInflammationScore || 0,
        vasomotor_score: results.dietScore || 0,
        psychological_score: results.lifestyleScore || 0,
        urogenital_score: results.bmiScore || 0,
        somatic_score: results.waistScore || 0,
        severity: severity,
        recommendations: Array.isArray(results.recommendations) ? results.recommendations : [],
        // Сохраняем все данные в answers (включая объяснения, описания, рекомендации)
        answers: results.answers || {
          questionAnswers: results.answers || {},
          demographics: ('demographics' in results ? (results as any).demographics : {}) || {},
          explanations: {},
          high_risk_categories: results.highRiskCategories || []
        },
      }
      
      // Логируем только в development (без чувствительных данных)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📝 Inserting inflammation quiz result')
      }
      
      // Проверяем, что test_type точно строка 'inflammation'
      if (insertData.test_type !== 'inflammation') {
        // Логируем только в development
        if (process.env.NODE_ENV === 'development') {
          logger.error('❌ test_type is not "inflammation"')
        }
        return NextResponse.json(
          { error: `Недопустимое значение test_type: ${insertData.test_type}` },
          { status: 400 }
        )
      }
      
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert(insertData)
        .select('id')
        .single()
      savedResult = data
      saveError = error
      
      if (error) {
        logger.error('❌ Supabase insert error:', error)
        logger.error('   Error code:', error.code)
        logger.error('   Error message:', error.message)
        logger.error('   Error details:', error.details)
        logger.error('   Error hint:', error.hint)
      }
    } else if (testType === 'mrs') {
      // Save MRS quiz results (existing logic)
      // Type guard: проверяем, что это MRS результат
      if (!('totalScore' in results)) {
        return NextResponse.json(
          { error: 'Отсутствуют данные результатов теста MRS' },
          { status: 400 }
        )
      }
      // Теперь TypeScript знает, что это MRS результат
      const mrsResults = results as { 
        totalScore: number
        vasomotorScore?: number
        psychologicalScore?: number
        urogenitalScore?: number
        somaticScore?: number
        severity?: string
        recommendations?: string[]
        answers?: any
        [key: string]: any
      }
      const insertData = {
        user_id: userId,
        email: userEmail,
        test_type: 'mrs' as const, // Явно указываем тип
        total_score: mrsResults.totalScore,
        vasomotor_score: mrsResults.vasomotorScore,
        psychological_score: mrsResults.psychologicalScore,
        urogenital_score: mrsResults.urogenitalScore,
        somatic_score: mrsResults.somaticScore,
        severity: mrsResults.severity,
        recommendations: Array.isArray(mrsResults.recommendations) ? mrsResults.recommendations : [],
        // Сохраняем все данные в answers (включая объяснения, описания, рекомендации)
        answers: mrsResults.answers || [],
      }
      
      // Логируем только в development (без чувствительных данных)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📝 Inserting MRS quiz result')
      }
      
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert(insertData)
        .select('id')
        .single()
      savedResult = data
      saveError = error
    } else if (testType === 'phenoage') {
      // Save PhenoAge quiz results
      // Type guard: проверяем, что это PhenoAge результат
      if (!('phenoAge' in results)) {
        return NextResponse.json(
          { error: 'Отсутствуют данные результатов теста PhenoAge' },
          { status: 400 }
        )
      }
      // Теперь TypeScript знает, что это PhenoAge результат
      const phenoageResults = results as { 
        phenoAge: number
        chronologicalAge?: number
        difference?: number
        mortalityScore?: number
        interpretation?: string
        recommendations?: string[]
        answers?: any
        [key: string]: any
      }
      const insertData = {
        user_id: userId,
        email: userEmail,
        test_type: 'phenoage' as const,
        total_score: Math.round(phenoageResults.phenoAge || 0), // Используем phenoAge как total_score
        vasomotor_score: 0, // Не применимо для PhenoAge
        psychological_score: 0, // Не применимо для PhenoAge
        urogenital_score: 0, // Не применимо для PhenoAge
        somatic_score: 0, // Не применимо для PhenoAge
        severity: (phenoageResults.difference || 0) < -5 ? 'mild' : 
                  (phenoageResults.difference || 0) >= -5 && (phenoageResults.difference || 0) <= 5 ? 'moderate' : 
                  (phenoageResults.difference || 0) > 5 && (phenoageResults.difference || 0) <= 10 ? 'severe' : 'very_severe',
        recommendations: Array.isArray(phenoageResults.recommendations) ? phenoageResults.recommendations : [],
        // Сохраняем все данные в answers
        answers: phenoageResults.answers || {
          phenoAge: phenoageResults.phenoAge,
          chronologicalAge: phenoageResults.chronologicalAge,
          difference: phenoageResults.difference,
          mortalityScore: phenoageResults.mortalityScore,
          interpretation: phenoageResults.interpretation,
          formData: phenoageResults.answers?.formData || {},
          biomarkerAnalyses: phenoageResults.answers?.biomarkerAnalyses || []
        },
      }
      
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📝 Inserting PhenoAge quiz result')
      }
      
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert(insertData)
        .select('id')
        .single()
      savedResult = data
      saveError = error
      
      if (error) {
        // Логируем только в development
        if (process.env.NODE_ENV === 'development') {
          logger.error('❌ Supabase insert error:', error.code)
        }
      }
    } else if (testType === 'frax') {
      // Save FRAX quiz results
      // Type guard: проверяем, что это FRAX результат
      if (!('hipFractureRisk10y' in results || 'majorOsteoporoticFractureRisk10y' in results)) {
        return NextResponse.json(
          { error: 'Отсутствуют данные результатов теста FRAX' },
          { status: 400 }
        )
      }
      // Теперь TypeScript знает, что это FRAX результат
      const fraxResults = results as { 
        hipFractureRisk10y?: number
        majorOsteoporoticFractureRisk10y?: number
        riskLevel?: string
        recommendations?: string[]
        answers?: any
        [key: string]: any
      }
      const insertData = {
        user_id: userId,
        email: userEmail,
        test_type: 'frax' as const,
        total_score: Math.round((fraxResults.hipFractureRisk10y || 0) + (fraxResults.majorOsteoporoticFractureRisk10y || 0)), // Сумма рисков как total_score
        vasomotor_score: 0, // Не применимо для FRAX
        psychological_score: 0, // Не применимо для FRAX
        urogenital_score: 0, // Не применимо для FRAX
        somatic_score: 0, // Не применимо для FRAX
        severity: fraxResults.riskLevel === 'low' ? 'mild' : 
                  fraxResults.riskLevel === 'moderate' ? 'moderate' : 
                  fraxResults.riskLevel === 'high' ? 'severe' : 'moderate',
        recommendations: Array.isArray(fraxResults.recommendations) ? fraxResults.recommendations : [],
        // Сохраняем все данные в answers
        answers: fraxResults.answers || {
          hipFractureRisk10y: fraxResults.hipFractureRisk10y,
          majorOsteoporoticFractureRisk10y: fraxResults.majorOsteoporoticFractureRisk10y,
          riskLevel: fraxResults.riskLevel,
          questionAnswers: fraxResults.answers?.questionAnswers || {},
          explanations: fraxResults.answers?.explanations || {}
        },
      }
      
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📝 Inserting FRAX quiz result')
      }
      
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert(insertData)
        .select('id')
        .single()
      savedResult = data
      saveError = error
      
      if (error) {
        // Логируем только в development
        if (process.env.NODE_ENV === 'development') {
          logger.error('❌ Supabase insert error:', error.code)
          logger.error('   Error message:', error.message)
        }
      }
    } else if (testType === 'whr') {
      // Save WHR quiz results
      // Type guard: проверяем, что это WHR результат
      if (!('bmi' in results || 'whr' in results || 'whtr' in results)) {
        return NextResponse.json(
          { error: 'Отсутствуют данные результатов теста WHR' },
          { status: 400 }
        )
      }
      // Теперь TypeScript знает, что это WHR результат
      const whrResults = results as { 
        bmi?: number
        whr?: number
        whtr?: number
        bmiCategory?: string
        whrCategory?: string
        whtrCategory?: string
        overallRisk?: string
        recommendations?: string[]
        answers?: any
        [key: string]: any
      }
      const insertData = {
        user_id: userId,
        email: userEmail,
        test_type: 'whr' as const,
        total_score: Math.round((whrResults.bmi || 0) * 10 + (whrResults.whr || 0) * 100 + (whrResults.whtr || 0) * 100), // Комбинированный score
        vasomotor_score: 0, // Не применимо для WHR
        psychological_score: 0, // Не применимо для WHR
        urogenital_score: 0, // Не применимо для WHR
        somatic_score: 0, // Не применимо для WHR
        severity: whrResults.overallRisk === 'low' ? 'mild' : 
                  whrResults.overallRisk === 'moderate' ? 'moderate' : 
                  whrResults.overallRisk === 'high' ? 'severe' : 
                  whrResults.overallRisk === 'very_high' ? 'severe' : 'moderate',
        recommendations: Array.isArray(whrResults.recommendations) ? whrResults.recommendations : [],
        // Сохраняем все данные в answers
        answers: whrResults.answers || {
          bmi: whrResults.bmi,
          whr: whrResults.whr,
          whtr: whrResults.whtr,
          bmiCategory: whrResults.bmiCategory,
          whrCategory: whrResults.whrCategory,
          whtrCategory: whrResults.whtrCategory,
          overallRisk: whrResults.overallRisk,
          questionAnswers: whrResults.answers?.questionAnswers || {},
          explanations: whrResults.answers?.explanations || {}
        },
      }
      
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('📝 Inserting WHR quiz result')
      }
      
      const { data, error } = await supabase
        .from('menohub_quiz_results')
        .insert(insertData)
        .select('id')
        .single()
      savedResult = data
      saveError = error
      
      if (error) {
        logger.error('❌ Supabase insert error:', error)
      }
    }

    if (saveError) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ Error saving quiz results:', saveError.message)
      }
      return NextResponse.json(
        {
          error: 'Не удалось сохранить результаты',
          ...(process.env.NODE_ENV === 'development' && { details: saveError.message }),
        },
        { status: 500 }
      )
    }

    if (!savedResult || !savedResult.id) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        logger.error('❌ No result ID returned from insert')
      }
      return NextResponse.json(
        { error: 'Не удалось сохранить результаты: нет ID результата' },
        { status: 500 }
      )
    }

    // Логируем только в development (без ID)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('✅ Successfully saved quiz result')
    }

    // Return success response
    return NextResponse.json({
      success: true,
      resultId: savedResult.id,
      userId: userId,
      email: userEmail,
      message: 'Результаты успешно сохранены',
    })
  } catch (error) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error in save-results API:', error)
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

