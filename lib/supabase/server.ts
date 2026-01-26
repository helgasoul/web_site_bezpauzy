import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client
// For App Router, we'll use a simpler approach initially
// Full SSR support can be added later with @supabase/ssr

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing Supabase environment variables')
    }
    // В development создаем клиент с пустыми значениями (будет ошибка при использовании, но не при загрузке)
    console.warn('Missing Supabase environment variables. Some features may not work.')
    return createSupabaseClient(supabaseUrl || '', supabaseAnonKey || '')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Create Supabase client with service role key (for admin operations)
 * Use this for operations that require elevated permissions (e.g., accessing private Storage buckets)
 * This bypasses RLS policies and should only be used in server-side API routes
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

