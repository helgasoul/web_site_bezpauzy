import { NextRequest, NextResponse } from 'next/server'
import { generateInflammationQuizPDF } from '@/lib/pdf/generate-quiz-pdf'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Валидация данных
    if (!data.total_inflammation_score && data.total_inflammation_score !== 0) {
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза' },
        { status: 400 }
      )
    }

    console.log('📄 Начинаем генерацию PDF для квиза на воспаление...')
    
    // Генерируем PDF (async функция)
    const doc = await generateInflammationQuizPDF({
      total_inflammation_score: data.total_inflammation_score || 0,
      inflammation_level: data.inflammation_level || 'moderate',
      diet_score: data.diet_score || 0,
      lifestyle_score: data.lifestyle_score || 0,
      bmi_score: data.bmi_score || 0,
      waist_score: data.waist_score || 0,
      bmi: data.bmi || 0,
      high_risk_categories: data.high_risk_categories || [],
      demographics: data.demographics || {
        age_range: '',
        height_cm: 0,
        weight_kg: 0,
      },
      recommendations: data.recommendations || [],
    })

    // Конвертируем в Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Возвращаем PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inflammation-quiz-results-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating inflammation quiz PDF:', error)
    return NextResponse.json(
      { error: 'Ошибка при генерации PDF' },
      { status: 500 }
    )
  }
}

