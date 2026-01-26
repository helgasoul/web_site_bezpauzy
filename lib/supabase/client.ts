import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// В development режиме не выбрасываем ошибку, чтобы можно было тестировать без Supabase
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase environment variables')
  }
  // В development создаем клиент с пустыми значениями (будет ошибка при использовании, но не при загрузке)
  console.warn('⚠️ Missing Supabase environment variables. Some features may not work.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

