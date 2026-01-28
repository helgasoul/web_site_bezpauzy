# Исправление: Создаются две записи пользователя вместо обновления

## Проблема

Создаются две записи в таблице `menohub_users`:
1. **id: 110** - `telegram_id: 374683580`, `consent_granted: TRUE` (при согласии в боте)
2. **id: 111** - `telegram_id: 0`, `consent_granted: FALSE` (при привязке через код)

Вместо этого должна быть **одна запись**, которая обновляется.

## Причины

### Проблема 1: При согласии создается новая запись

**Текущая логика**:
```
Get a row (по telegram_id) → не найден → Create a row (создает новую запись)
```

**Проблема**: Если пользователь уже существует на сайте (создан через API), но еще не дал согласие в боте, создается дубликат.

### Проблема 2: При привязке через код создается новая запись

**Текущая логика**:
```
Update user telegram_id → использует user_id (который null) → не находит → создается новая запись?
```

**Проблема**: Узел "Update user telegram_id" использует неправильное поле и не находит существующую запись.

## Решения

### Решение 1: Исправить логику при согласии

**Текущий flow**:
```
Get a row (по telegram_id)
  ├─ Найден → обновить consent_granted
  └─ Не найден → Create a row
```

**Проблема**: Если пользователь существует на сайте (id: 110), но `telegram_id = 0`, узел "Get a row" не найдет его.

**Исправление**: Добавить проверку по `telegram_id` ИЛИ по `id` из кода привязки.

### Решение 2: Исправить логику при привязке через код

**Текущий узел "Update user telegram_id"**:
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $json.user_id }}"
}
```

**Проблема**: Использует `user_id` из текущего узла (который может быть `null` или из неправильного источника).

**Исправление**: Использовать `website_user_id` из узла "Get link code from DB":
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $('Get link code from DB').item.json.website_user_id }}"
}
```

### Решение 3: Проверять существование пользователя перед созданием

**Добавить проверку** перед "Create a row":

**Новый узел**: "Check if user exists by website_user_id"

**Тип**: Supabase  
**Операция**: get  
**Таблица**: menohub_users  
**Фильтр**:
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $('Get link code from DB').item.json.website_user_id }}"
}
```

**Логика**:
- Если пользователь найден → обновить `telegram_id`
- Если не найден → создать новую запись (но это не должно происходить, если код создан правильно)

## Рекомендуемое решение

### Шаг 1: Исправить узел "Update user telegram_id"

**Изменить фильтр**:
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $('Get link code from DB').item.json.website_user_id }}"
}
```

**Добавить проверку на null** перед этим узлом:

**Новый узел**: "IF website_user_id exists"

**Тип**: IF  
**Условие**:
```json
{
  "leftValue": "=={{ $('Get link code from DB').item.json.website_user_id }}",
  "rightValue": "",
  "operator": {
    "type": "string",
    "operation": "exists",
    "singleValue": true
  }
}
```

**Соединения**:
- `true` → "Update user telegram_id"
- `false` → Сообщение об ошибке

### Шаг 2: Исправить логику при согласии

**Проблема**: При согласии создается запись, даже если пользователь уже существует на сайте.

**Решение**: Перед "Create a row" добавить проверку по `telegram_id`:

**Текущий узел "Get a row"** уже проверяет по `telegram_id`, но проблема в том, что если пользователь существует на сайте с `telegram_id = 0`, он не будет найден.

**Исправление**: Если пользователь не найден по `telegram_id`, но есть код привязки, использовать `website_user_id` из кода.

Но это сложно, так как при согласии кода привязки может не быть.

**Простое решение**: Убедиться, что при согласии проверяется существование пользователя, и если он существует, обновляется, а не создается новый.

## Проверка текущей логики

### При согласии (consent_agree):

1. **Get a row** - ищет по `telegram_id`
2. Если не найден → **Create a row** - создает новую запись
3. Если найден → обновляет `consent_granted`

**Проблема**: Если пользователь существует на сайте с `telegram_id = 0`, он не будет найден, и создастся дубликат.

### При привязке через код:

1. **Extract link code** - извлекает код
2. **Get link code from DB** - находит код, возвращает `website_user_id`
3. **Update user telegram_id** - должен обновить пользователя по `website_user_id`

**Проблема**: Использует неправильное поле (`user_id` вместо `website_user_id`).

## Итоговое решение

1. **Исправить узел "Update user telegram_id"** - использовать `website_user_id` из "Get link code from DB"
2. **Добавить проверку на null** перед обновлением
3. **Проверить логику при согласии** - убедиться, что не создаются дубликаты

## SQL для проверки дубликатов

```sql
-- Найти пользователей с одинаковым telegram_id
SELECT telegram_id, COUNT(*) as count
FROM menohub_users
WHERE telegram_id != 0
GROUP BY telegram_id
HAVING COUNT(*) > 1;

-- Найти пользователей, которые должны быть объединены
SELECT 
  id,
  telegram_id,
  consent_granted,
  created_at,
  website_user_id
FROM menohub_users
WHERE telegram_id = 374683580
ORDER BY created_at;
```

## Объединение дубликатов

Если уже есть дубликаты, их нужно объединить:

```sql
-- Обновить основную запись (id: 110) данными из дубликата (id: 111)
UPDATE menohub_users
SET 
  consent_granted = COALESCE(consent_granted, FALSE),
  is_active = TRUE
WHERE id = 110;

-- Удалить дубликат (id: 111)
DELETE FROM menohub_users WHERE id = 111;
```

**Внимание**: Перед удалением убедитесь, что все связанные данные перенесены в основную запись!


