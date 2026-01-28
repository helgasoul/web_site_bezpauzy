# Исправление: Узел "Get link code from DB" возвращает пустой результат

## Проблема

**INPUT** узла "Get link code from DB":
```json
[
  {
    "code": "2VPM8A",
    "telegram_id": 374683580,
    "user_id": null
  }
]
```

**OUTPUT** узла:
```json
[{}]
```

Код не найден в базе данных, хотя должен быть.

## Возможные причины

1. **Код не существует в БД** - API не создал код
2. **Код уже использован** - `used = true`
3. **Код истек** - `expires_at < now()` (код действителен 10 минут)
4. **Проблема с регистром** - код в БД в другом регистре
5. **Проблема с фильтром** - неправильный синтаксис в n8n

## Диагностика

### Шаг 1: Проверьте базу данных напрямую

Выполните SQL запрос в Supabase:

```sql
SELECT 
  code,
  UPPER(code) as code_upper,
  website_user_id,
  telegram_id,
  used,
  expires_at,
  created_at,
  NOW() as current_time,
  expires_at > NOW() as is_valid,
  used = false as is_unused
FROM menohub_telegram_auth_codes
WHERE UPPER(code) = UPPER('2VPM8A')
ORDER BY created_at DESC
LIMIT 5;
```

**Проверьте**:
- Существует ли запись с кодом `2VPM8A`
- `used = false`?
- `is_valid = true` (не истек)?
- Какой регистр кода в БД?

### Шаг 2: Проверьте синтаксис фильтра в n8n

**Текущий фильтр**:
```json
{
  "keyName": "code",
  "condition": "eq",
  "keyValue": "={{ $json.code }}"
}
```

**Проблема**: В n8n может быть проблема с синтаксисом `={{ }}`. 

**Попробуйте**:
1. Использовать `=={{ $json.code }}` (двойной `=`)
2. Или использовать `{{ $json.code }}` без `=`

### Шаг 3: Добавьте логирование перед запросом

**Добавьте узел "Log before DB query"** перед "Get link code from DB":

```javascript
const inputData = $input.all();

console.log('=== Before DB query ===');
inputData.forEach((item, index) => {
  console.log(`Item ${index + 1}:`, JSON.stringify(item.json, null, 2));
  console.log('Code to search:', item.json.code);
  console.log('Code type:', typeof item.json.code);
  console.log('Code length:', item.json.code?.length);
});

return inputData;
```

### Шаг 4: Проверьте настройки узла Supabase

**В узле "Get link code from DB"**:

1. **Убедитесь, что выбраны все поля**:
   - В настройках Supabase узла должна быть опция "Select fields" или "Return all fields"
   - Или используйте `*` для получения всех полей

2. **Проверьте формат значения фильтра**:
   - Попробуйте использовать `=={{ $json.code }}` вместо `={{ $json.code }}`
   - Или попробуйте `{{ $('Extract link code').item.json.code }}`

### Шаг 5: Упростите фильтр для тестирования

**Временно упростите фильтр** - оставьте только проверку по коду:

```json
{
  "filters": {
    "conditions": [
      {
        "keyName": "code",
        "condition": "eq",
        "keyValue": "=={{ $json.code }}"
      }
    ]
  }
}
```

Уберите проверки `used = false` и `expires_at > now()` временно, чтобы проверить, находится ли код вообще.

## Исправления

### Исправление 1: Использовать правильный синтаксис для фильтра

**Попробуйте разные варианты**:

**Вариант A** (с двойным `=`):
```json
{
  "keyValue": "=={{ $json.code }}"
}
```

**Вариант B** (без `=`):
```json
{
  "keyValue": "{{ $json.code }}"
}
```

**Вариант C** (прямая ссылка на предыдущий узел):
```json
{
  "keyValue": "=={{ $('Extract link code').item.json.code }}"
}
```

### Исправление 2: Использовать UPPER() для сравнения без учета регистра

Если в Supabase поддерживается, можно использовать функцию:

```json
{
  "keyName": "code",
  "condition": "eq",
  "keyValue": "=={{ $json.code.toUpperCase() }}"
}
```

Но это может не работать в n8n. Лучше нормализовать код в узле "Extract link code".

### Исправление 3: Проверить, что код создается правильно

**Проверьте API** `/api/auth/link-telegram/generate-code`:

1. Откройте консоль браузера (F12)
2. Нажмите "Привязать Telegram"
3. Проверьте ответ API - должен быть `code: "2VPM8A"`
4. Проверьте логи сервера - должен быть `website_user_id`

**Проверьте базу данных сразу после создания кода**:
```sql
SELECT * FROM menohub_telegram_auth_codes
WHERE created_at > NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC
LIMIT 1;
```

## Альтернативное решение: Использовать Code узел с прямым SQL

Если фильтры в Supabase узле не работают, можно использовать Code узел:

```javascript
const code = $('Extract link code').first().json.code;
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Из переменных окружения
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Из переменных окружения

// Используйте Supabase REST API
const response = await fetch(
  `${supabaseUrl}/rest/v1/menohub_telegram_auth_codes?code=eq.${code}&used=eq.false&expires_at=gt.${new Date().toISOString()}&limit=1`,
  {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();

console.log('=== Supabase REST API result ===');
console.log('Code searched:', code);
console.log('Results:', JSON.stringify(data, null, 2));

if (data && data.length > 0) {
  return [{
    json: data[0]
  }];
} else {
  return [{
    json: {}
  }];
}
```

Но это сложнее и требует настройки переменных окружения.

## Рекомендуемый порядок действий

1. **Проверьте базу данных** - убедитесь, что код существует
2. **Проверьте синтаксис фильтра** - попробуйте `=={{ }}` вместо `={{ }}`
3. **Упростите фильтр** - оставьте только проверку по коду
4. **Добавьте логирование** - чтобы увидеть, что именно ищется
5. **Проверьте регистр** - убедитесь, что код в верхнем регистре

## Частая ошибка

**Проблема**: Код создается, но сразу истекает или помечается как использованный.

**Решение**: Проверьте логику создания кода в API - возможно, `expires_at` устанавливается неправильно или `used` сразу становится `true`.


