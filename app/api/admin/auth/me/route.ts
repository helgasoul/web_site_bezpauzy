import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'

export async function GET(request: NextRequest) {
  try {
    // Таймаут для всего запроса (3 секунды)
    const timeoutPromise = new Promise<NextResponse>((resolve) => {
      setTimeout(() => {
        resolve(
          NextResponse.json(
            { admin: null, error: 'Request timeout' },
            { status: 408 }
          )
        )
      }, 3000)
    })

    const authPromise = (async () => {
      try {
        const { admin, error } = await requireAdmin(request)

        if (!admin || error) {
          return NextResponse.json(
            { admin: null, error: error || 'Unauthorized' },
            { status: 401 }
          )
        }

        return NextResponse.json({
          admin: {
            id: admin.id,
            email: admin.email,
            role: admin.role,
          },
        })
      } catch (error) {
        console.error('❌ [Admin Auth Me] Error:', error)
        return NextResponse.json(
          { admin: null, error: 'Internal server error' },
          { status: 500 }
        )
      }
    })()

    // Используем Promise.race для таймаута
    return await Promise.race([authPromise, timeoutPromise])
  } catch (error) {
    console.error('❌ [Admin Auth Me] Unexpected error:', error)
    return NextResponse.json(
      { admin: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
