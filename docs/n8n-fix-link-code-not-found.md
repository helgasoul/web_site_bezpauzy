# Исправление: Код привязки не найден в базе данных

## Проблема

Узел "Get link code from DB" не находит код в таблице `menohub_telegram_auth_codes`, хотя код был сгенерирован.

**Пример**: Код `2SBOM2` не найден, хотя он был создан через API.

## Возможные причины

1. **Код не был создан** - API `/api/auth/link-telegram/generate-code` не отработал
2. **Код уже использован** - поле `used = true`
3. **Код истек** - `expires_at < now()` (код действителен 10 минут)
4. **Проблема с регистром** - код сохранен в другом регистре (uppercase/lowercase)
5. **Неправильный фильтр** - фильтр в n8n настроен неправильно

## Проверка 1: Убедиться, что код создается

**Проверьте логи API** при генерации кода:
- Откройте консоль браузера (F12)
- Нажмите кнопку "Привязать Telegram"
- Проверьте, что API вернул код и `deepLink`

**Проверьте базу данных**:
```sql
SELECT * FROM menohub_telegram_auth_codes 
WHERE code = '2SBOM2' 
ORDER BY created_at DESC 
LIMIT 1;
```

## Проверка 2: Настройка фильтра в n8n

**Текущая настройка** (из скриншота):
- **Table**: `menohub_telegram_auth_codes`
- **Operation**: Get Many
- **Limit**: 1
- **Filter**: `code = {{ $json.code }}`

**Проблема**: Может быть проблема с регистром или форматом кода.

### Исправление фильтра

**Вариант 1: Использовать UPPER() для сравнения**

В Supabase можно использовать функции для сравнения без учета регистра. Но в n8n это сложнее.

**Вариант 2: Нормализовать код перед поиском**

Обновить узел "Extract link code", чтобы всегда возвращать код в верхнем регистре:

```javascript
const code = linkMatch[1].toUpperCase(); // Уже есть в коде
```

**Вариант 3: Добавить дополнительные фильтры**

В узле "Get link code from DB" добавьте проверки:

**Текущие фильтры**:
- `code = {{ $json.code }}`
- `used = false`
- `expires_at > {{ $now }}`

**Убедитесь, что все три условия установлены!**

## Проверка 3: Добавить логирование

**Добавьте узел "Log before DB query"** перед "Get link code from DB":

```javascript
const inputData = $input.all();

inputData.forEach((item, index) => {
  console.log(`=== Item ${index + 1} before DB query ===`);
  console.log('Code:', item.json.code);
  console.log('Code type:', typeof item.json.code);
  console.log('Code length:', item.json.code?.length);
  console.log('Full item:', JSON.stringify(item.json, null, 2));
});

return inputData;
```

## Проверка 4: Проверить формат кода в базе

**SQL запрос для проверки**:
```sql
-- Проверить все коды, похожие на искомый
SELECT 
  code,
  UPPER(code) as code_upper,
  LOWER(code) as code_lower,
  used,
  expires_at,
  created_at,
  NOW() as current_time,
  expires_at > NOW() as is_valid
FROM menohub_telegram_auth_codes 
WHERE UPPER(code) = UPPER('2SBOM2')
ORDER BY created_at DESC;
```

## Исправление: Обновить фильтр в n8n

### Шаг 1: Проверить формат кода

В узле "Extract link code" убедитесь, что код всегда в верхнем регистре:

```javascript
const code = linkMatch[1].toUpperCase();
console.log('Extracted code:', code);
```

### Шаг 2: Обновить фильтр в "Get link code from DB"

**Текущий фильтр**:
```
code = {{ $json.code }}
```

**Попробуйте**:
1. Убедитесь, что используется правильное поле: `code` (не `code_id`, не `link_code`)
2. Проверьте тип данных: должно быть `string`
3. Попробуйте использовать `UPPER()` в Supabase (если поддерживается)

### Шаг 3: Добавить проверку в коде

**Обновить узел "Get link code from DB"** - добавить Code узел после него для проверки:

```javascript
const inputData = $input.all();

console.log('=== Get link code from DB result ===');
inputData.forEach((item, index) => {
  console.log(`Item ${index + 1}:`, JSON.stringify(item.json, null, 2));
  
  if (!item.json || Object.keys(item.json).length === 0) {
    console.error('No data returned from DB!');
    console.error('Searched code:', $('Extract link code').first().json.code);
  }
});

return inputData;
```

## Альтернативное решение: Использовать прямой SQL запрос

Если фильтры не работают, можно использовать Code узел с прямым SQL запросом через Supabase:

```javascript
const code = $('Extract link code').first().json.code;
const supabase = $('Supabase').first().json; // Если есть узел Supabase

// Используйте Supabase REST API напрямую
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/menohub_telegram_auth_codes?code=eq.${code}&used=eq.false&expires_at=gt.${new Date().toISOString()}&limit=1`,
  {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  }
);

const data = await response.json();

return [{
  json: data[0] || {}
}];
```

Но это сложнее и требует настройки переменных окружения.

## Рекомендуемый порядок действий

1. **Проверьте базу данных** - убедитесь, что код существует:
   ```sql
   SELECT * FROM menohub_telegram_auth_codes WHERE code = '2SBOM2';
   ```

2. **Проверьте логи API** - убедитесь, что код создается правильно

3. **Добавьте логирование** - чтобы увидеть, что именно ищется

4. **Проверьте фильтры** - убедитесь, что все три условия установлены:
   - `code = {{ $json.code }}`
   - `used = false`
   - `expires_at > {{ $now }}`

5. **Проверьте регистр** - убедитесь, что код всегда в верхнем регистре

## Частая ошибка

**Проблема**: Код создается, но сразу истекает или помечается как использованный.

**Решение**: Проверьте логику создания кода в API - возможно, `expires_at` устанавливается неправильно.


