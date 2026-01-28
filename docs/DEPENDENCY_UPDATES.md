# Регулярные обновления зависимостей

Руководство по поддержанию зависимостей проекта в актуальном состоянии и обеспечению безопасности.

## Быстрый старт

### Ежедневная проверка (опционально)
```bash
npm run security:audit
```

### Еженедельная проверка (рекомендуется)
```bash
npm run security:check
npm run deps:outdated
```

### Ежемесячное обновление
```bash
npm run security:fix
npm run deps:update
```

## Доступные команды

### Проверка безопасности

#### `npm run security:audit`
Полная проверка уязвимостей во всех зависимостях.

```bash
npm run security:audit
```

**Что проверяет:**
- Все известные уязвимости в зависимостях
- Критические, высокие, средние и низкие уязвимости
- Прямые и транзитивные зависимости

**Пример вывода:**
```
found 0 vulnerabilities
```

#### `npm run security:fix`
Автоматическое исправление уязвимостей, которые можно исправить обновлением версий.

```bash
npm run security:fix
```

**Что делает:**
- Обновляет пакеты с уязвимостями до безопасных версий
- Исправляет только те уязвимости, которые можно исправить автоматически
- Не изменяет семантические версии (major updates требуют ручного обновления)

**⚠️ Внимание:** После выполнения проверьте, что проект все еще работает:
```bash
npm run build
npm run lint
```

#### `npm run security:check`
Проверка уязвимостей с уровнем moderate и выше (игнорирует low).

```bash
npm run security:check
```

Полезно для быстрой проверки критических проблем.

### Проверка устаревших пакетов

#### `npm run deps:outdated`
Показывает список пакетов, для которых доступны обновления.

```bash
npm run deps:outdated
```

**Пример вывода:**
```
Package          Current  Wanted  Latest  Location
next             14.0.0   14.0.4  14.0.4  bezpauzy-website
react            18.2.0   18.2.0  19.0.0  bezpauzy-website
```

**Колонки:**
- **Current** - текущая установленная версия
- **Wanted** - последняя версия, совместимая с `package.json`
- **Latest** - последняя доступная версия (может быть major update)

#### `npm run deps:update`
Обновляет все пакеты до последних совместимых версий (в пределах semver).

```bash
npm run deps:update
```

**Что делает:**
- Обновляет пакеты до версий, указанных в `package.json` (patch и minor)
- Не обновляет major версии (требуют ручного обновления)
- Обновляет `package-lock.json`

**⚠️ Внимание:** После обновления:
1. Проверьте, что проект работает: `npm run build`
2. Запустите тесты (если есть)
3. Проверьте линтер: `npm run lint`

#### `npm run deps:check`
Полная проверка: устаревшие пакеты + уязвимости.

```bash
npm run deps:check
```

Эквивалентно:
```bash
npm outdated && npm audit
```

## Рекомендуемый график обновлений

### Ежедневно (опционально)
- Быстрая проверка безопасности: `npm run security:audit`

### Еженедельно
1. Проверка уязвимостей: `npm run security:check`
2. Проверка устаревших пакетов: `npm run deps:outdated`
3. Если найдены критические уязвимости - немедленное исправление

### Ежемесячно
1. Полная проверка: `npm run deps:check`
2. Автоматическое исправление: `npm run security:fix`
3. Обновление пакетов: `npm run deps:update`
4. Тестирование после обновлений

### Перед каждым деплоем
1. `npm run deps:check` - убедиться, что нет критических проблем
2. `npm run build` - проверить, что проект собирается
3. `npm run lint` - проверить код

## Обновление major версий

Major обновления (например, React 18 → 19) требуют особого внимания:

### Процесс обновления major версии

1. **Проверка changelog:**
   ```bash
   # Посмотреть изменения в пакете
   npm view <package-name> versions --json
   ```

2. **Обновление в package.json:**
   ```json
   {
     "dependencies": {
       "package-name": "^19.0.0"  // было ^18.2.0
     }
   }
   ```

3. **Установка:**
   ```bash
   npm install
   ```

4. **Проверка:**
   ```bash
   npm run build
   npm run lint
   npm run dev  # Проверить вручную
   ```

5. **Исправление breaking changes:**
   - Прочитать migration guide пакета
   - Обновить код согласно новому API
   - Протестировать все функции

## Автоматизация в CI/CD

### GitHub Actions пример

```yaml
name: Security Check

on:
  schedule:
    - cron: '0 0 * * 1'  # Каждый понедельник
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run security:check
      - run: npm run deps:outdated
```

### Vercel / Netlify

Добавьте в настройки build:
```bash
npm ci && npm run security:check && npm run build
```

## Мониторинг уязвимостей

### GitHub Dependabot

Настройте Dependabot для автоматических PR с обновлениями:

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

### Snyk / npm audit

Для более детального анализа можно использовать:
- [Snyk](https://snyk.io/) - расширенный анализ уязвимостей
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - встроенная проверка

## Troubleshooting

### Проблема: `npm audit fix` не исправляет уязвимости

**Решение:**
1. Проверьте, есть ли обновления: `npm outdated`
2. Обновите вручную: `npm install package@latest`
3. Если уязвимость в транзитивной зависимости - обновите родительский пакет

### Проблема: После обновления проект не собирается

**Решение:**
1. Откатите изменения: `git checkout package.json package-lock.json`
2. Обновляйте пакеты по одному
3. Проверяйте changelog каждого пакета

### Проблема: Конфликты peer dependencies

**Решение:**
```bash
npm install --legacy-peer-deps
```

Или обновите пакеты, которые требуют обновленные peer dependencies.

## Best Practices

1. **Регулярность:** Проверяйте зависимости еженедельно
2. **Тестирование:** Всегда тестируйте после обновлений
3. **Документирование:** Записывайте breaking changes при major обновлениях
4. **Автоматизация:** Настройте CI/CD для автоматических проверок
5. **Приоритет:** Критические уязвимости исправляйте немедленно

## Текущий статус

**Последняя проверка:** Автоматически при каждом `npm install`

**Уязвимости:** 0 (проверено через `npm audit`)

**Всего зависимостей:** 187
- Production: 159
- Optional: 25
- Peer: 4

## См. также

- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [npm outdated documentation](https://docs.npmjs.com/cli/v8/commands/npm-outdated)
- [Semantic Versioning](https://semver.org/)
- [Security Audit](../SECURITY_AUDIT.md)

