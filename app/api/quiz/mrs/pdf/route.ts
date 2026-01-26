import { NextRequest, NextResponse } from 'next/server'
import { generateMRSQuizPDF } from '@/lib/pdf/generate-quiz-pdf-react'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Получен запрос на генерацию MRS PDF (React PDF)')
    const data = await request.json()
    console.log('📊 Данные получены:', JSON.stringify(data, null, 2))

    // Валидация данных
    if (data.total_score === undefined && data.total_score !== 0) {
      console.error('❌ Отсутствует total_score:', data)
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза: total_score обязателен' },
        { status: 400 }
      )
    }

    // Подготавливаем данные для генерации PDF
    const pdfData = {
      total_score: data.total_score ?? 0,
      severity: data.severity || 'mild',
      vasomotor_score: data.vasomotor_score ?? 0,
      psychological_score: data.psychological_score ?? 0,
      urogenital_score: data.urogenital_score ?? 0,
      somatic_score: data.somatic_score ?? 0,
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    }

    console.log('🔄 Начинаю генерацию PDF с данными:', pdfData)
    
    // Генерируем PDF (возвращает Buffer напрямую)
    const pdfBuffer = await generateMRSQuizPDF(pdfData)

    console.log(`✅ PDF сгенерирован, размер: ${pdfBuffer.length} байт`)

    // Возвращаем PDF
    // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mrs-quiz-results-${Date.now()}.pdf"`,
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

