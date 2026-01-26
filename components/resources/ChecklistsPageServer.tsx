import { getPublishedResources } from '@/lib/supabase/resources'
import { ChecklistsPageClient } from './ChecklistsPageClient'

export async function ChecklistsPageServer() {
  // Загружаем все опубликованные чек-листы из Supabase
  const resources = await getPublishedResources('checklist')

  // Если чек-листов нет, передаём пустой массив (компонент покажет пустое состояние)
  return <ChecklistsPageClient resources={resources || []} />
}

