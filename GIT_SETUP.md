# Инструкция по настройке Git и подключению к GitHub

## Важно!

Репозиторий на GitHub уже создан: **helgasoul/web_site_bezpauzy**

## Шаг 1: Откройте терминал в директории проекта

Убедитесь, что вы находитесь в директории проекта (там, где находится `package.json`).

## Шаг 2: Инициализация git

```bash
git init
git branch -M main
```

## Шаг 3: Добавление файлов

```bash
git add package.json tsconfig.json next.config.js tailwind.config.ts postcss.config.js .eslintrc.json .gitignore README.md SETUP.md
git add app/ components/ lib/ next-env.d.ts
```

Или добавьте все файлы проекта (кроме тех, что в .gitignore):

```bash
git add .
```

## Шаг 4: Первый commit

```bash
git commit -m "Initial commit: Setup Next.js project with TypeScript, Tailwind CSS, and design system"
```

## Шаг 5: Подключение к GitHub

```bash
git remote add origin https://github.com/helgasoul/web_site_bezpauzy.git
```

## Шаг 6: Отправка кода на GitHub

Если на GitHub уже есть README (который мы создали), сначала нужно объединить:

```bash
git pull origin main --allow-unrelated-histories
```

Затем отправьте код:

```bash
git push -u origin main
```

## Альтернативный способ (использование скрипта)

Можно использовать готовый скрипт:

```bash
chmod +x setup-git.sh
./setup-git.sh
```

Затем выполните push:

```bash
git push -u origin main
```

## Проверка

После успешной отправки откройте:
https://github.com/helgasoul/web_site_bezpauzy

Все файлы должны быть там!

## В дальнейшем

Для сохранения изменений используйте:

```bash
git add .
git commit -m "Описание изменений"
git push
```



