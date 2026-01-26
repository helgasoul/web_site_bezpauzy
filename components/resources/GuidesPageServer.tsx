import { getPublishedResources } from '@/lib/supabase/resources'
import { GuidesPageClient } from './GuidesPageClient'

export async function GuidesPageServer() {
  // Загружаем все опубликованные гайды из Supabase
  const resources = await getPublishedResources('guide')

  // Если гайдов нет, передаём пустой массив (компонент покажет пустое состояние)
  return <GuidesPageClient resources={resources || []} />
}

