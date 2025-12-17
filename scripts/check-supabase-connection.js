/**
 * Скрипт для проверки подключения к Supabase
 * Запустите: node scripts/check-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Проверка подключения к Supabase...\n')

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL не найден в .env.local')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY не найден в .env.local')
  process.exit(1)
}

console.log('✅ Переменные окружения найдены:')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)

// Простая проверка доступности API
fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  }
})
  .then(response => {
    if (response.ok) {
      console.log('\n✅ Подключение к Supabase успешно!')
      console.log('   API доступен и отвечает')
    } else {
      console.log(`\n⚠️  API вернул статус: ${response.status}`)
      console.log('   Проверьте правильность URL и ключа')
    }
  })
  .catch(error => {
    console.error('\n❌ Ошибка подключения:')
    console.error(`   ${error.message}`)
    console.error('\n💡 Возможные причины:')
    console.error('   - Неправильный URL')
    console.error('   - Проблемы с сетью')
    console.error('   - Supabase сервер недоступен')
    process.exit(1)
  })

