import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client
// For App Router, we'll use a simpler approach initially
// Full SSR support can be added later with @supabase/ssr

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

