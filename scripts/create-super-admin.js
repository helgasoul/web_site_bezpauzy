/**
 * Скрипт для создания первого суперадмина
 * 
 * Использование:
 * node scripts/create-super-admin.js <email> <password>
 * 
 * Пример:
 * node scripts/create-super-admin.js admin@bezpauzy.com MySecurePassword123
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены в .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSuperAdmin(email, password) {
  console.log('🔐 Создание первого суперадмина...\n')

  // Валидация email
  if (!email || !email.includes('@')) {
    console.error('❌ Ошибка: Укажите корректный email')
    process.exit(1)
  }

  // Валидация пароля
  if (!password || password.length < 8) {
    console.error('❌ Ошибка: Пароль должен быть не менее 8 символов')
    process.exit(1)
  }

  try {
    // Проверяем, есть ли уже админы
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .eq('is_active', true)

    if (checkError) {
      console.error('❌ Ошибка при проверке существующих админов:', checkError.message)
      process.exit(1)
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('⚠️  Внимание: В системе уже есть активные админы:')
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role})`)
      })
      console.log('\n💡 Если вы хотите создать еще одного суперадмина, продолжайте.')
    }

    // Проверяем, не существует ли уже админ с таким email
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      console.error(`❌ Ошибка: Админ с email ${email} уже существует!`)
      process.exit(1)
    }

    // Хешируем пароль
    console.log('🔒 Хеширование пароля...')
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Создаем суперадмина
    console.log('👤 Создание суперадмина...')
    const { data: newAdmin, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email: email,
        password_hash: passwordHash,
        role: 'super_admin',
        is_active: true,
        created_by: null, // Первый админ создается без created_by
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Ошибка при создании суперадмина:', createError.message)
      process.exit(1)
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Суперадмин успешно создан!')
    console.log('='.repeat(50))
    console.log(`📧 Email: ${newAdmin.email}`)
    console.log(`👑 Роль: ${newAdmin.role}`)
    console.log(`🆔 ID: ${newAdmin.id}`)
    console.log(`📅 Создан: ${new Date(newAdmin.created_at).toLocaleString('ru-RU')}`)
    console.log('\n💡 Сохраните эти данные в безопасном месте!')
    console.log('🚀 Теперь вы можете войти в админ-панель по адресу: /admin/login')
    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  }
}

// Получаем аргументы из командной строки
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('❌ Ошибка: Укажите email и пароль')
  console.log('\nИспользование:')
  console.log('  node scripts/create-super-admin.js <email> <password>')
  console.log('\nПример:')
  console.log('  node scripts/create-super-admin.js admin@bezpauzy.com MySecurePassword123')
  process.exit(1)
}

const [email, password] = args

createSuperAdmin(email, password)
  .then(() => {
    console.log('\n✅ Готово!')
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  })
