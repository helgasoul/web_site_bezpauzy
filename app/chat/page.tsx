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

      // Проверяем пользователя в БД и получаем информацию о подписке
      const supabase = await createClient()
      const { data: dbUser, error } = await supabase
        .from('menohub_users')
        .select('id, telegram_id, email, subscription_status, subscription_plan')
        .eq('id', sessionData.userId)
        .single()

      if (!error && dbUser) {
        user = {
          id: dbUser.id,
          telegramId: dbUser.telegram_id || null, // Может быть null, если пользователь зарегистрирован только на сайте
          email: dbUser.email || undefined,
          subscriptionStatus: dbUser.subscription_status || undefined,
          subscriptionPlan: dbUser.subscription_plan || undefined,
        }
      }
    } catch (e) {
      // Сессия невалидна
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
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
              <ChatAuthGate user={user ? {
                ...user,
                telegramId: user.telegramId || 0, // ChatAuthGate ожидает number, не null
              } : null} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

