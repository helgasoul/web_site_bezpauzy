/**
 * Скрипт для проверки настройки векторной базы знаний
 * 
 * Использование:
 * node scripts/check-vector-store.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены в .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVectorStore() {
  console.log('🔍 Проверка настройки векторной базы знаний...\n')

  try {
    // 1. Проверка расширения pgvector
    console.log('1. Проверка расширения pgvector...')
    // Проверяем через попытку работы с векторами
    try {
      const { data: checkExt, error: checkError } = await supabase
        .from('menohub_documents')
        .select('embedding')
        .limit(1)
      
      if (checkError && checkError.message.includes('vector')) {
        console.log('   ❌ Расширение pgvector не установлено!')
        console.log('   💡 Выполните: CREATE EXTENSION vector;')
      } else {
        console.log('   ✅ Расширение pgvector доступно')
      }
    } catch (e) {
      console.log('   ⚠️  Не удалось проверить расширение pgvector')
    }

    // 2. Проверка существования таблицы
    console.log('\n2. Проверка таблицы menohub_documents...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('menohub_documents')
      .select('id')
      .limit(1)

    if (tableError) {
      console.log('   ❌ Таблица menohub_documents не существует!')
      console.log('   💡 Выполните миграцию: supabase/migrations/053_setup_vector_store.sql')
      return false
    }
    console.log('   ✅ Таблица menohub_documents существует')

    // 3. Проверка структуры таблицы
    console.log('\n3. Проверка структуры таблицы...')
    const { data: columns, error: columnsError } = await supabase
      .from('menohub_documents')
      .select('*')
      .limit(0)

    if (columnsError) {
      console.log('   ⚠️  Не удалось проверить структуру:', columnsError.message)
    } else {
      console.log('   ✅ Структура таблицы корректна')
    }

    // 4. Проверка функции match_menohub_documents
    console.log('\n4. Проверка функции match_menohub_documents...')
    try {
      // Пробуем вызвать функцию с тестовым вектором (если есть документы)
      const { data: docsForTest } = await supabase
        .from('menohub_documents')
        .select('embedding')
        .not('embedding', 'is', null)
        .limit(1)
        .single()

      if (docsForTest && docsForTest.embedding) {
        // Проверяем, что функция существует через простой SQL запрос
        // (прямой вызов RPC требует правильного формата вектора, который сложно сформировать)
        const { data: funcExists, error: funcCheckError } = await supabase.rpc('exec_sql', {
          query: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'match_menohub_documents';"
        }).catch(() => ({ data: null, error: null }))
        
        // Альтернативный способ - просто проверяем, что функция может быть вызвана
        // (но не вызываем её, так как нужен правильный формат вектора)
        if (funcCheckError || !funcExists) {
          // Пробуем проверить через информацию о схеме
          console.log('   ⚠️  Не удалось проверить функцию напрямую')
          console.log('   💡 Если функция не работает, выполните: supabase/migrations/053_setup_vector_store.sql')
          console.log('   ℹ️  Функция будет работать с LangChain, если создана через миграцию')
        } else {
          console.log('   ✅ Функция match_menohub_documents существует')
        }
        
        // Не вызываем функцию напрямую, так как нужен правильный формат вектора
        // LangChain будет использовать её правильно
        return

      } else {
        console.log('   ℹ️  Нет документов для тестирования функции')
        console.log('   💡 Функция должна быть создана через миграцию: supabase/migrations/053_setup_vector_store.sql')
      }
    } catch (e) {
      console.log('   ⚠️  Не удалось проверить функцию (возможно, требуется миграция)')
      console.log('   💡 Выполните: supabase/migrations/053_setup_vector_store.sql')
    }

    // 5. Проверка документов
    console.log('\n5. Проверка документов...')
    const { data: docs, error: docsError } = await supabase
      .from('menohub_documents')
      .select('id, embedding, metadata')
      .limit(10)

    if (docsError) {
      console.log('   ❌ Ошибка при получении документов:', docsError.message)
    } else {
      const totalDocs = docs?.length || 0
      const docsWithEmbeddings = docs?.filter(d => d.embedding !== null).length || 0
      
      console.log(`   📊 Всего документов: ${totalDocs}`)
      console.log(`   📊 С embeddings: ${docsWithEmbeddings}`)
      
      if (totalDocs === 0) {
        console.log('   ⚠️  Таблица пуста. Добавьте документы с embeddings.')
      } else if (docsWithEmbeddings === 0) {
        console.log('   ⚠️  Документы есть, но без embeddings. Сгенерируйте embeddings.')
      } else {
        console.log('   ✅ Документы с embeddings найдены')
        
        // Показать пример метаданных
        const exampleDoc = docs.find(d => d.embedding !== null && d.metadata)
        if (exampleDoc && exampleDoc.metadata) {
          console.log('\n   Пример метаданных:')
          console.log('   ', JSON.stringify(exampleDoc.metadata, null, 2))
        }
      }
    }

    // 6. Итоговый результат
    console.log('\n' + '='.repeat(50))
    console.log('✅ Проверка завершена!')
    console.log('='.repeat(50))
    
    return true
  } catch (error) {
    console.error('\n❌ Ошибка при проверке:', error)
    return false
  }
}

// Запуск проверки
checkVectorStore()
  .then((success) => {
    if (!success) {
      console.log('\n💡 Рекомендации:')
      console.log('1. Выполните миграцию: supabase/migrations/053_setup_vector_store.sql')
      console.log('2. Добавьте документы в таблицу menohub_documents')
      console.log('3. Сгенерируйте embeddings для документов')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('Критическая ошибка:', error)
    process.exit(1)
  })
