# Руководство по версионированию проекта

## Текущая ситуация

**Статус Git:**
- ❌ Git репозиторий **НЕ инициализирован** в директории проекта
- ✅ Репозиторий на GitHub существует: `helgasoul/web_site_bezpauzy`
- ✅ Версия в `package.json`: `1.0.0`
- ✅ Создан `CHANGELOG.md` для отслеживания изменений

## Когда последний раз заливали код на GitHub?

**Ответ:** Код **НИКОГДА** не был залит на GitHub из этой директории, так как:
1. Git репозиторий не был инициализирован локально
2. Нет истории коммитов
3. Нет связи с удаленным репозиторием

## Настройка Git и первого коммита

### Шаг 1: Удалите неправильный репозиторий (если создан)

```bash
# Удалите репозиторий из домашней директории (если он там)
rm -rf ~/.git
```

### Шаг 2: Инициализация в правильной директории

Откройте терминал в директории проекта и выполните:

```bash
# Перейдите в директорию проекта
cd "/Users/olgapuchkova/Documents/Документы — MacBook Air — Olga/PERSONAL/МОИ ПРОЕКТЫ/ПЛАТФОРМА ЖЕНСКОГО ЗДОРОВЬЯ/Проект Без | паузы/Бот Без|паузы/САЙТ"

# Инициализируйте Git
git init
git branch -M main

# Подключите удаленный репозиторий
git remote add origin https://github.com/helgasoul/web_site_bezpauzy.git

# Проверьте подключение
git remote -v
```

### Шаг 3: Первый коммит

```bash
# Добавьте все файлы (кроме тех, что в .gitignore)
git add .

# Создайте первый коммит
git commit -m "Initial commit: Website with authentication system

- Added registration and login system
- Added Telegram ID linking
- Added user dashboard
- Added quiz results history
- Added chat integration
- Database migrations for auth system"

# Отправьте на GitHub
git push -u origin main
```

## Система версионирования

### Текущая версия: `1.0.0`

Проект использует [Semantic Versioning](https://semver.org/lang/ru/):
- **MAJOR** (1.0.0) - несовместимые изменения API
- **MINOR** (0.1.0) - новая функциональность с обратной совместимостью
- **PATCH** (0.0.1) - исправления ошибок с обратной совместимостью

### Обновление версии

Используйте npm скрипты:

```bash
# Патч-версия (1.0.0 → 1.0.1) - для исправлений
npm run version:patch

# Минорная версия (1.0.0 → 1.1.0) - для новых функций
npm run version:minor

# Мажорная версия (1.0.0 → 2.0.0) - для больших изменений
npm run version:major
```

### Процесс обновления версии

1. **Обновите версию:**
   ```bash
   npm run version:patch  # или minor, или major
   ```

2. **Обновите CHANGELOG.md:**
   - Добавьте новую секцию с номером версии
   - Переместите изменения из `[Unreleased]` в новую версию
   - Добавьте дату релиза

3. **Создайте коммит:**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to X.Y.Z"
   ```

4. **Создайте тег:**
   ```bash
   git tag -a v1.0.1 -m "Version 1.0.1: Описание изменений"
   ```

5. **Отправьте на GitHub:**
   ```bash
   git push origin main
   git push origin v1.0.1  # Отправьте тег
   ```

## Рекомендации по коммитам

### Формат сообщений коммитов

```
Тип: Краткое описание (до 50 символов)

Подробное описание (если нужно)

Типы:
- feat: новая функциональность
- fix: исправление ошибки
- docs: изменения в документации
- style: форматирование кода
- refactor: рефакторинг
- test: добавление тестов
- chore: обновление зависимостей, конфигурации
```

### Примеры хороших коммитов

```bash
git commit -m "feat: Add user registration with username/password"
git commit -m "fix: Cookie not setting on login"
git commit -m "refactor: Simplify authentication flow"
git commit -m "docs: Update CHANGELOG for version 1.0.1"
```

## Чеклист перед коммитом

- [ ] Код протестирован локально
- [ ] Нет ошибок линтера (`npm run lint`)
- [ ] Обновлен `CHANGELOG.md` (если нужно)
- [ ] Обновлена версия в `package.json` (если нужно)
- [ ] Создан понятный commit message

## История версий

См. `CHANGELOG.md` для подробной истории изменений.

