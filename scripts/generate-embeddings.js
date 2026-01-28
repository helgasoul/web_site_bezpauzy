/**
 * Скрипт для генерации embeddings для документов в menohub_documents
 * 
 * Использование:
 * node scripts/generate-embeddings.js
 * 
 * Требования:
 * - OPENAI_API_KEY в .env.local
 * - SUPABASE_SERVICE_ROLE_KEY в .env.local
 * - Таблица menohub_documents должна существовать
 */

const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены')
  process.exit(1)
}

if (!openaiApiKey) {
  console.error('❌ Ошибка: OPENAI_API_KEY должен быть установлен')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

/**
 * Генерация embedding для текста через OpenAI
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // или 'text-embedding-ada-002'
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('❌ Ошибка генерации embedding:', error)
    throw error
  }
}

/**
 * Генерация embeddings для всех документов без embeddings
 */
async function generateEmbeddingsForAll() {
  console.log('🔄 Генерация embeddings для документов...\n')

  try {
    // Получаем все документы без embeddings
    const { data: documents, error: fetchError } = await supabase
      .from('menohub_documents')
      .select('id, content')
      .is('embedding', null)

    if (fetchError) {
      console.error('❌ Ошибка при получении документов:', fetchError)
      return
    }

    if (!documents || documents.length === 0) {
      console.log('✅ Все документы уже имеют embeddings!')
      return
    }

    console.log(`📊 Найдено документов без embeddings: ${documents.length}\n`)

    // Обрабатываем документы по одному (чтобы не превысить rate limits)
    let processed = 0
    let errors = 0

    for (const doc of documents) {
      try {
        console.log(`⏳ Обработка документа ${doc.id}...`)
        
        // Генерируем embedding
        const embedding = await generateEmbedding(doc.content)

        // Обновляем документ
        const { error: updateError } = await supabase
          .from('menohub_documents')
          .update({ embedding: `[${embedding.join(',')}]` })
          .eq('id', doc.id)

        if (updateError) {
          console.error(`   ❌ Ошибка обновления: ${updateError.message}`)
          errors++
        } else {
          console.log(`   ✅ Embedding сгенерирован и сохранен`)
          processed++
        }

        // Небольшая задержка, чтобы не превысить rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`   ❌ Ошибка для документа ${doc.id}:`, error.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Обработано: ${processed}`)
    if (errors > 0) {
      console.log(`❌ Ошибок: ${errors}`)
    }
    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

/**
 * Генерация embedding для одного документа
 */
async function generateEmbeddingForOne(documentId) {
  try {
    const { data: doc, error: fetchError } = await supabase
      .from('menohub_documents')
      .select('id, content, embedding')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      console.error('❌ Документ не найден:', fetchError)
      return
    }

    if (doc.embedding) {
      console.log('⚠️  Документ уже имеет embedding')
      return
    }

    console.log('🔄 Генерация embedding...')
    const embedding = await generateEmbedding(doc.content)

    const { error: updateError } = await supabase
      .from('menohub_documents')
      .update({ embedding: `[${embedding.join(',')}]` })
      .eq('id', documentId)

    if (updateError) {
      console.error('❌ Ошибка обновления:', updateError)
    } else {
      console.log('✅ Embedding сгенерирован и сохранен')
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
  }
}

// Запуск
const args = process.argv.slice(2)

if (args.length > 0 && args[0] === '--id') {
  // Генерация для одного документа
  const documentId = args[1]
  if (!documentId) {
    console.error('❌ Укажите ID документа: node scripts/generate-embeddings.js --id <document-id>')
    process.exit(1)
  }
  generateEmbeddingForOne(documentId)
} else {
  // Генерация для всех документов
  generateEmbeddingsForAll()
}
