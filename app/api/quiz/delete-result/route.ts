import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

/**
 * DELETE /api/quiz/delete-result
 * Удаляет результат квиза по ID
 * Body: { resultId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { resultId } = await request.json()

    if (!resultId) {
      return NextResponse.json(
        { error: 'ID результата обязателен' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Проверяем сессию пользователя через безопасную JWT проверку
    const sessionData = await getSession()

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    // Преобразуем userId в правильный тип
    let userId: number
    if (typeof sessionData.userId === 'number') {
      userId = sessionData.userId
    } else if (typeof sessionData.userId === 'string') {
      userId = parseInt(sessionData.userId, 10)
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: 'Неверный формат ID пользователя' },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Не удалось определить пользователя' },
        { status: 401 }
      )
    }

    // Проверяем, что результат принадлежит пользователю
    const { data: result, error: fetchError } = await supabase
      .from('menohub_quiz_results')
      .select('id, user_id')
      .eq('id', resultId)
      .single()

    if (fetchError || !result) {
      return NextResponse.json(
        { error: 'Результат не найден' },
        { status: 404 }
      )
    }

    if (result.user_id !== userId) {
      return NextResponse.json(
        { error: 'Нет доступа к этому результату' },
        { status: 403 }
      )
    }

    // Удаляем результат
    const { error: deleteError } = await supabase
      .from('menohub_quiz_results')
      .delete()
      .eq('id', resultId)
      .eq('user_id', userId)

    if (deleteError) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting result:', deleteError)
      }
      return NextResponse.json(
        {
          error: 'Не удалось удалить результат',
          ...(process.env.NODE_ENV === 'development' && { details: deleteError.message }),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Результат успешно удален',
    })
  } catch (error) {
    console.error('Error in delete-result API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

