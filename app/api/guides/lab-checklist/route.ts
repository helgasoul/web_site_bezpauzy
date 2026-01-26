import { NextRequest, NextResponse } from 'next/server'
import { generateLabChecklistPDF } from '@/lib/pdf/generate-lab-checklist-pdf'

export async function GET(request: NextRequest) {
  try {
    console.log('📄 Начинаю генерацию чек-листа анализов...')
    
    // Генерируем PDF
    const pdfBuffer = await generateLabChecklistPDF()

    console.log('✅ PDF успешно сгенерирован, размер:', pdfBuffer.length, 'байт')

    // Кодируем имя файла для Content-Disposition (поддержка кириллицы)
    // Используем RFC 5987 формат: filename для ASCII fallback, filename* для UTF-8
    const fileName = 'Чеклист_лабораторных_анализов_менопауза.pdf'
    const encodedFileName = encodeURIComponent(fileName)
    const asciiFileName = 'lab-checklist-menopause.pdf' // ASCII fallback для старых браузеров

    // Возвращаем PDF файл
    // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('❌ Ошибка при генерации чек-листа:', error)
    console.error('   Message:', error?.message)
    console.error('   Stack:', error?.stack)
    
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации чеклиста',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

