# Настройка GitHub аутентификации

## Проблема

Ошибка: "Failed to push branch HEAD. Configure GitHub auth and try again."

Это означает, что нужно настроить аутентификацию GitHub для отправки изменений.

## Решение 1: Использовать Personal Access Token (рекомендуется)

### Шаг 1: Создать Personal Access Token на GitHub

1. Зайдите на [GitHub.com](https://github.com) и войдите в аккаунт
2. Перейдите в **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
4. Дайте название токену (например, "bezpauzy-website")
5. Выберите срок действия (рекомендуется: 90 дней или "No expiration")
6. Выберите права доступа:
   - ✅ `repo` (полный доступ к репозиториям)
   - ✅ `workflow` (если используете GitHub Actions)
7. Нажмите **"Generate token"**
8. **Скопируйте токен сразу** (он показывается только один раз!)

### Шаг 2: Настроить Git для использования токена

#### Вариант A: Через Git Credential Manager (автоматически)

1. При следующем push Git спросит логин и пароль
2. **Логин**: ваш GitHub username
3. **Пароль**: вставьте Personal Access Token (не ваш обычный пароль!)

#### Вариант B: Сохранить токен в Git (вручную)

```bash
# Сохранить токен для GitHub
git config --global credential.helper store

# При следующем push введите:
# Username: ваш-github-username
# Password: ваш-personal-access-token
```

#### Вариант C: Использовать SSH ключ (более безопасно)

1. Создайте SSH ключ (если еще нет):

   ```bash
   ssh-keygen -t ed25519 -C "o.s.puchkova@icloud.com"
   ```

2. Скопируйте публичный ключ:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. Добавьте ключ на GitHub:
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Вставьте скопированный ключ
   - Сохраните

4. Измените remote URL на SSH:

   ```bash
   git remote set-url origin git@github.com:ваш-username/ваш-репозиторий.git
   ```

## Решение 2: Использовать GitHub CLI (gh)

### Установка GitHub CLI

```bash
# На Mac через Homebrew
brew install gh

# Или скачайте с https://cli.github.com
```

### Авторизация

```bash
gh auth login
```

Следуйте инструкциям на экране.

## Решение 3: Использовать GitHub Desktop

1. Скачайте [GitHub Desktop](https://desktop.github.com)
2. Войдите в свой GitHub аккаунт
3. GitHub Desktop автоматически настроит аутентификацию

## Проверка настройки

После настройки проверьте:

```bash
# Проверить remote URL
git remote -v

# Попробовать push
git push origin main
```

## Если репозиторий еще не создан

Если вы видите ошибку "not a git repository", сначала инициализируйте репозиторий:

```bash
# Инициализировать git репозиторий
git init

# Добавить все файлы
git add .

# Сделать первый коммит
git commit -m "Initial commit"

# Добавить remote (замените на ваш репозиторий)
git remote add origin https://github.com/ваш-username/ваш-репозиторий.git

# Установить ветку main
git branch -M main

# Отправить на GitHub
git push -u origin main
```

## Безопасность

⚠️ **Важно:**
- Никогда не коммитьте токены или пароли в код
- Используйте `.gitignore` для исключения `.env.local` и других секретных файлов
- Регулярно обновляйте токены
- Используйте SSH ключи для большей безопасности

## Полезные ссылки

- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [GitHub SSH Keys](https://github.com/settings/keys)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

