import { NextRequest, NextResponse } from 'next/server'
import { generatePhenoAgePDF } from '@/lib/pdf/generate-quiz-pdf-react'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Получен запрос на генерацию PhenoAge PDF')
    const data = await request.json()
    console.log('📊 Данные получены:', JSON.stringify(data, null, 2))

    // Валидация данных
    if (data.phenoAge === undefined) {
      console.error('❌ Отсутствует phenoAge:', data)
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза: phenoAge обязателен' },
        { status: 400 }
      )
    }

    // Подготавливаем данные для генерации PDF
    const pdfData = {
      phenoAge: data.phenoAge ?? 0,
      chronologicalAge: data.chronologicalAge ?? data.formData?.age ?? 0,
      difference: data.difference ?? 0,
      interpretation: data.interpretation || '',
      biomarkerAnalyses: data.biomarkerAnalyses || [],
      formData: data.formData || {},
    }

    console.log('🔄 Начинаю генерацию PDF с данными:', pdfData)
    
    // Генерируем PDF
    const pdfBuffer = await generatePhenoAgePDF(pdfData)

    console.log(`✅ PDF сгенерирован, размер: ${pdfBuffer.length} байт`)

    // Возвращаем PDF
    // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="phenoage-results-${Date.now()}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('❌ Ошибка генерации PDF:', error)
    console.error('   Type:', typeof error)
    console.error('   Message:', error?.message)
    console.error('   Stack:', error?.stack)
    
    // Логируем детали только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('PDF generation error:', error?.message || 'Неизвестная ошибка')
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации PDF',
        ...(process.env.NODE_ENV === 'development' && {
          details: error?.message || 'Неизвестная ошибка',
        }),
      },
      { status: 500 }
    )
  }
}

