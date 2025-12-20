import { NextRequest, NextResponse } from 'next/server'
import { generateMRSQuizPDF } from '@/lib/pdf/generate-quiz-pdf'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Валидация данных
    if (!data.total_score && data.total_score !== 0) {
      return NextResponse.json(
        { error: 'Отсутствуют данные результатов квиза' },
        { status: 400 }
      )
    }

    // Генерируем PDF (async функция)
    const doc = await generateMRSQuizPDF({
      total_score: data.total_score || 0,
      severity: data.severity || 'mild',
      vasomotor_score: data.vasomotor_score || 0,
      psychological_score: data.psychological_score || 0,
      urogenital_score: data.urogenital_score || 0,
      somatic_score: data.somatic_score || 0,
      recommendations: data.recommendations || [],
    })

    // Конвертируем в Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Возвращаем PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mrs-quiz-results-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating MRS quiz PDF:', error)
    return NextResponse.json(
      { error: 'Ошибка при генерации PDF' },
      { status: 500 }
    )
  }
}

