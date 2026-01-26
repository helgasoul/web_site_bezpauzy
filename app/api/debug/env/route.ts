import { NextResponse } from 'next/server'

/**
 * DEBUG endpoint для проверки загрузки переменных окружения
 * Используйте только в development!
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const envVars = {
    // Supabase
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'не установлен',
    
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) || 'не установлен',
    
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    serviceRoleKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) || 'не установлен',
    serviceRoleKeyIsPlaceholder: process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('your_') || false,
    
    // YooKassa
    hasYooKassaShopId: !!process.env.YOOKASSA_SHOP_ID,
    yooKassaShopId: process.env.YOOKASSA_SHOP_ID || 'не установлен',
    yooKassaShopIdIsPlaceholder: process.env.YOOKASSA_SHOP_ID?.includes('your_') || false,
    
    hasYooKassaSecretKey: !!process.env.YOOKASSA_SECRET_KEY,
    yooKassaSecretKeyLength: process.env.YOOKASSA_SECRET_KEY?.length || 0,
    yooKassaSecretKeyPreview: process.env.YOOKASSA_SECRET_KEY?.substring(0, 30) || 'не установлен',
    yooKassaSecretKeyIsPlaceholder: process.env.YOOKASSA_SECRET_KEY?.includes('your_') || false,
    
    // Site URL
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'не установлен',
    
    // Общая информация
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
  }

  return NextResponse.json(envVars, { status: 200 })
}
