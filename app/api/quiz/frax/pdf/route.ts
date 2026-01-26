import { NextRequest, NextResponse } from 'next/server'
import { generateFRAXQuizPDF } from '@/lib/pdf/generate-quiz-pdf-react'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Получен запрос на генерацию FRAX PDF (React PDF)')
    const data = await request.json()
    console.log('📊 Данные получены:', JSON.stringify(data, null, 2))

    // Валидация данных
    if (data.hip_fracture_risk_10y === undefined && data.hip_fracture_risk_10y !== 0) {
      console.error('❌ Отсутствует hip_fracture_risk_10y:', data)
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза: hip_fracture_risk_10y обязателен' },
        { status: 400 }
      )
    }

    if (data.major_osteoporotic_fracture_risk_10y === undefined && data.major_osteoporotic_fracture_risk_10y !== 0) {
      console.error('❌ Отсутствует major_osteoporotic_fracture_risk_10y:', data)
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза: major_osteoporotic_fracture_risk_10y обязателен' },
        { status: 400 }
      )
    }

    // Подготавливаем данные для генерации PDF
    const pdfData = {
      hip_fracture_risk_10y: data.hip_fracture_risk_10y ?? 0,
      major_osteoporotic_fracture_risk_10y: data.major_osteoporotic_fracture_risk_10y ?? 0,
      risk_level: data.risk_level || 'moderate',
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      answers: data.answers || {},
    }

    console.log('🔄 Начинаю генерацию PDF с данными:', pdfData)
    
    // Генерируем PDF (возвращает Buffer напрямую)
    const pdfBuffer = await generateFRAXQuizPDF(pdfData)

    console.log(`✅ PDF сгенерирован, размер: ${pdfBuffer.length} байт`)

    // Возвращаем PDF
    // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="frax-quiz-results-${Date.now()}.pdf"`,
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

