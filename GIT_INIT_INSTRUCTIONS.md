# Инструкция по инициализации Git

## Проблема с кодировкой пути

Из-за кириллицы в пути к проекту команды `cd` не работают в терминале через инструменты. 

## Решение: Запустите скрипт вручную

### Шаг 1: Откройте терминал в директории проекта

1. Откройте Finder
2. Перейдите в папку проекта: `Документы — MacBook Air — Olga` → `PERSONAL` → `МОИ ПРОЕКТЫ` → `ПЛАТФОРМА ЖЕНСКОГО ЗДОРОВЬЯ` → `Проект Без | паузы` → `Бот Без|паузы` → `САЙТ`
3. Правой кнопкой на папке → "Сервисы" → "Новый терминал в папке" (или перетащите папку в окно Terminal)

### Шаг 2: Запустите скрипт

```bash
bash init-git.sh
```

Скрипт автоматически:
- ✅ Инициализирует Git репозиторий
- ✅ Подключит удаленный репозиторий на GitHub
- ✅ Добавит все файлы
- ✅ Создаст первый коммит

### Шаг 3: Отправьте на GitHub

После успешного выполнения скрипта:

```bash
# Если на GitHub уже есть файлы (README и т.д.)
git pull origin main --allow-unrelated-histories

# Отправьте код на GitHub
git push -u origin main
```

## Альтернатива: Ручная инициализация

Если скрипт не работает, выполните команды вручную:

```bash
# 1. Инициализация
git init
git branch -M main

# 2. Подключение к GitHub
git remote add origin https://github.com/helgasoul/web_site_bezpauzy.git

# 3. Добавление файлов
git add .

# 4. Первый коммит
git commit -m "Initial commit: Website with authentication system v1.0.0"

# 5. Отправка на GitHub
git pull origin main --allow-unrelated-histories  # если нужно
git push -u origin main
```

## Проверка

После успешной отправки откройте:
https://github.com/helgasoul/web_site_bezpauzy

Все файлы должны быть там!

