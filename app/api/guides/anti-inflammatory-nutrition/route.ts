import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Путь к файлу гайда
    const filePath = join(process.cwd(), 'Противовоспалительное питание.docx')

    // Проверяем существование файла
    try {
      const fileBuffer = readFileSync(filePath)

      // Возвращаем DOCX файл
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Противовоспалительное питание.docx"',
        },
      })
    } catch (fileError) {
      console.error('Error reading guide file:', fileError)
      return NextResponse.json(
        { error: 'Файл гайда не найден' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error serving guide:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке гайда' },
      { status: 500 }
    )
  }
}

