import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatAuthGate } from '@/components/chat/ChatAuthGate'
import { BackButton } from '@/components/ui/BackButton'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

interface ChatPageProps {
  searchParams: {
    quiz?: string
    level?: string
    score?: string
    article?: string
  }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  // Проверяем авторизацию
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('telegram_session')?.value

  console.log('[chat/page] Session token exists:', !!sessionToken)
  console.log('[chat/page] Session token length:', sessionToken?.length || 0)

  let user: {
    id: string
    telegramId: number | null
    email?: string
    subscriptionStatus?: string
    subscriptionPlan?: string
  } | null = null

  if (sessionToken) {
    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionToken, 'base64').toString()
      )

      // Преобразуем userId в правильный тип (может быть число или строка)
      const userId = typeof sessionData.userId === 'string' 
        ? parseInt(sessionData.userId, 10) 
        : sessionData.userId

      console.log('[chat/page] Parsed session data:', { userId, sessionData })

      // Проверяем пользователя в БД и получаем информацию о подписке
      const supabase = await createClient()
      // Пробуем получить оба поля - subscription_status и is_subscribed
      const { data: dbUser, error } = await supabase
        .from('menohub_users')
        .select('id, telegram_id, email, subscription_status, subscription_plan, is_subscribed')
        .eq('id', userId)
        .single()

      if (!error && dbUser) {
        // Определяем статус подписки: приоритет subscription_status, если нет - используем is_subscribed
        const subscriptionStatus = dbUser.subscription_status 
          ? (dbUser.subscription_status === 'active' ? 'active' : undefined)
          : (dbUser.is_subscribed ? 'active' : undefined)
        
        user = {
          id: String(dbUser.id), // Убеждаемся, что id - строка
          telegramId: dbUser.telegram_id || null, // Может быть null, если пользователь зарегистрирован только на сайте
          email: dbUser.email || undefined,
          subscriptionStatus: subscriptionStatus,
          subscriptionPlan: dbUser.subscription_plan || undefined,
        }
        console.log('[chat/page] User found:', { 
          id: user.id, 
          hasTelegramId: !!user.telegramId, 
          telegramId: user.telegramId,
          subscriptionStatus: user.subscriptionStatus,
          rawSubscriptionStatus: dbUser.subscription_status,
          rawIsSubscribed: dbUser.is_subscribed
        })
      } else {
        // Если пользователь не найден в БД, но есть сессия - это проблема
        // Оставляем user = null, чтобы показать экран регистрации
        console.error('[chat/page] User not found in DB:', { userId, error })
        user = null
      }
    } catch (e) {
      // Сессия невалидна
      console.error('[chat/page] Session parse error:', e)
      console.error('[chat/page] Error details:', e instanceof Error ? e.message : String(e))
      console.error('[chat/page] Error stack:', e instanceof Error ? e.stack : 'No stack')
    }
  } else {
    console.log('[chat/page] No session token found')
  }

  console.log('[chat/page] Final user state:', { 
    hasUser: !!user, 
    userId: user?.id, 
    hasTelegramId: !!user?.telegramId,
    subscriptionStatus: user?.subscriptionStatus 
  })

  console.log('[chat/page] RENDERING:', {
    hasUser: !!user,
    userSubscriptionStatus: user?.subscriptionStatus,
    willShowChatInterface: user && user.subscriptionStatus === 'active',
    willShowAuthGate: !user || user.subscriptionStatus !== 'active'
  })

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-card overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
            {user && user.subscriptionStatus === 'active' ? (
              <ChatInterface 
                userId={user.id} 
                telegramId={user.telegramId || undefined}
                quizContext={searchParams.quiz ? {
                  quizType: searchParams.quiz as 'inflammation' | 'mrs',
                  level: searchParams.level,
                  score: searchParams.score ? parseInt(searchParams.score) : undefined
                } : undefined}
                articleSlug={searchParams.article}
              />
            ) : (
              <div className="h-full overflow-y-auto">
                <ChatAuthGate 
                  user={user ? {
                    id: user.id,
                    telegramId: user.telegramId,
                    email: user.email,
                    subscriptionStatus: user.subscriptionStatus,
                    subscriptionPlan: user.subscriptionPlan,
                  } : null}
                  quizContext={searchParams.quiz ? {
                    quizType: searchParams.quiz as 'inflammation' | 'mrs',
                    level: searchParams.level,
                    score: searchParams.score ? parseInt(searchParams.score) : undefined
                  } : undefined}
                  articleSlug={searchParams.article}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

