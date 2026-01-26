import { NextRequest, NextResponse } from 'next/server'
import { generateInflammationQuizPDF } from '@/lib/pdf/generate-quiz-pdf-react'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Получен запрос на генерацию Inflammation PDF (React PDF)')
    const data = await request.json()
    console.log('📊 Данные получены:', JSON.stringify(data, null, 2))

    // Валидация данных
    if (data.total_inflammation_score === undefined && data.total_inflammation_score !== 0) {
      console.error('❌ Отсутствует total_inflammation_score:', data)
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза: total_inflammation_score обязателен' },
        { status: 400 }
      )
    }

    console.log('📄 Начинаем генерацию PDF для квиза на воспаление (React PDF)...')
    
    // Подготавливаем данные для генерации PDF
    const pdfData = {
      total_inflammation_score: data.total_inflammation_score ?? 0,
      inflammation_level: data.inflammation_level || 'moderate',
      diet_score: data.diet_score ?? 0,
      lifestyle_score: data.lifestyle_score ?? 0,
      bmi_score: data.bmi_score ?? 0,
      waist_score: data.waist_score ?? 0,
      bmi: data.bmi ?? 0,
      high_risk_categories: Array.isArray(data.high_risk_categories) ? data.high_risk_categories : [],
      demographics: data.demographics || {
        age_range: '',
        height_cm: 0,
        weight_kg: 0,
      },
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    }

    console.log('🔄 Генерирую PDF с данными:', pdfData)
    
    // Генерируем PDF (возвращает Buffer напрямую)
    const pdfBuffer = await generateInflammationQuizPDF(pdfData)

    console.log(`✅ PDF сгенерирован, размер: ${pdfBuffer.length} байт`)

    // Возвращаем PDF
    // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inflammation-quiz-results-${Date.now()}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('❌ Ошибка генерации PDF:', error)
    console.error('   Type:', typeof error)
    console.error('   Message:', error?.message)
    console.error('   Stack:', error?.stack)
    if (error?.cause) {
      console.error('   Cause:', error.cause)
    }
    
    // Логируем детали только в development
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error('PDF generation error:', errorMessage, errorStack)
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации PDF',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    )
  }
}

