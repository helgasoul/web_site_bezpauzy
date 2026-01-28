# Настройка безопасных JWT сессий

## 📋 Что изменилось

Система сессий была переведена с небезопасного base64-кодирования на **JWT (JSON Web Tokens) с подписью**.

### Преимущества JWT:
- ✅ **Подпись токена** - невозможно подделать без секретного ключа
- ✅ **Проверка целостности** - автоматическая проверка подписи
- ✅ **Срок действия** - токены автоматически истекают через 30 дней
- ✅ **Стандарт безопасности** - используется в индустрии

## 📦 Установка зависимостей

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

## 🔐 Настройка переменных окружения

Добавьте в `.env.local`:

```env
# JWT Secret для подписи токенов
# ВАЖНО: Используйте длинный случайный ключ в production!
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-for-security
```

**⚠️ КРИТИЧЕСКИ ВАЖНО:**
- Используйте **длинный случайный ключ** (минимум 32 символа)
- **Никогда не коммитьте** JWT_SECRET в git
- В production используйте **разные ключи** для разных окружений
- Можно сгенерировать ключ: `openssl rand -base64 32`

## 🔄 Миграция

Код автоматически поддерживает **обратную совместимость**:
- Старые base64 токены будут работать (legacy support)
- Новые токены создаются как JWT
- При следующем входе пользователь получит новый JWT токен

## 📝 Использование

### Создание сессии

```typescript
import { setSessionCookie } from '@/lib/auth/session'

setSessionCookie({
  userId: user.id,
  username: user.username,
  telegramId: user.telegram_id,
}, response)
```

### Проверка сессии

```typescript
import { getSession } from '@/lib/auth/session'

const sessionData = await getSession()
if (!sessionData) {
  // Пользователь не авторизован
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const userId = sessionData.userId
```

### Удаление сессии

```typescript
import { deleteSessionCookie } from '@/lib/auth/session'

const response = NextResponse.json({ success: true })
deleteSessionCookie(response)
return response
```

## ✅ Обновленные файлы

Все следующие файлы были обновлены для использования JWT:
- ✅ `app/api/auth/telegram/verify-code/route.ts`
- ✅ `app/api/auth/telegram/get-session/route.ts`
- ✅ `app/api/auth/register/route.ts`
- ✅ `app/api/auth/website/login/route.ts`
- ✅ `app/api/auth/email/login/route.ts`
- ✅ `app/api/auth/telegram/link-from-bot/route.ts`
- ✅ `app/api/auth/telegram/logout/route.ts`
- ✅ `app/api/quiz/save-results/route.ts`
- ✅ `app/api/quiz/get-results/route.ts`
- ✅ `app/api/quiz/delete-result/route.ts`
- ✅ `app/api/quiz/history/route.ts`

## 🔧 Структура JWT токена

```json
{
  "userId": 123,
  "telegramId": 456789,
  "username": "user123",
  "email": "user@example.com",
  "ageRange": "45-50",
  "iat": 1704067200,  // Issued at (timestamp)
  "exp": 1706659200   // Expiration (30 days from iat)
}
```

## 🛡️ Безопасность

### Что защищает JWT:
1. **Подпись** - токен подписан секретным ключом
2. **Проверка целостности** - любое изменение токена будет обнаружено
3. **Срок действия** - токены автоматически истекают
4. **Валидация** - проверка структуры и обязательных полей

### Рекомендации:
- Регулярно ротируйте JWT_SECRET (каждые 90 дней)
- Используйте HTTPS в production
- Храните JWT_SECRET в безопасном месте (Vercel Environment Variables, AWS Secrets Manager)

## 📚 Дополнительные ресурсы

- [JWT.io](https://jwt.io/) - Декодер и информация о JWT
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Документация библиотеки
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Последнее обновление:** 2025-01-05

