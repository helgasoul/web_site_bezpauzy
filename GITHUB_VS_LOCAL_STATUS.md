# Что лежит на GitHub, а что только локально

Краткий снимок состояния репозитория и как это проверить.

---

## Текущая картина

| Где | Что именно |
|-----|------------|
| **GitHub (origin)** | Один удалённый бранч: `main`. Репозиторий: `https://github.com/helgasoul/web_site_bezpauzy.git` |
| **Последний коммит на GitHub** | `5740ac9` — «Add documentation files and scripts for setup, Supabase, email, terminal, and GitHub auth» |
| **Твоя текущая ветка** | `auth-flow-fix` (она **не запушена** на GitHub) |
| **Локально впереди main** | **7 коммитов** — всё, что есть на `auth-flow-fix` после `5740ac9`, на GitHub нет |
| **Незакоммиченные изменения** | Много: изменённые (M), удалённые (D) и неотслеживаемые (??) файлы |

Итого: **на GitHub только старый main**. Вся работа по `auth-flow-fix`` и все незакоммиченные правки существуют только у тебя на диске.

---

## Как самому быстро «увидеть» разницу

Выполняй в корне проекта в терминале.

### 1. Что уже в Git, но ещё не на GitHub (коммиты)

```bash
git log origin/main..HEAD --oneline
```

Покажет коммиты, которые есть в текущей ветке, но нет в `origin/main`.

### 2. Список файлов, которые изменились только локально (рабочая копия)

```bash
# изменённые и удалённые
git status --short | grep '^ [MD]'

# новые неотслеживаемые (часть может быть в .gitignore)
git status --short | grep '^??'
```

### 3. Какие файлы точно будут добавлены в коммит, если сделать `git add .`

```bash
git status
```

`M` / `D` / `??` — то, что попадёт в следующий коммит после `git add .` (если не в `.gitignore`).

### 4. Что именно лежит на GitHub в main

```bash
git ls-tree -r origin/main --name-only
```

Список всех файлов в последнем коммите `origin/main`.

### 5. Полный отчёт «локально vs GitHub» одной командой

```bash
echo "=== Коммиты только локально (нет на GitHub) ===" && \
git log origin/main..HEAD --oneline && \
echo "" && \
echo "=== Файлы в последнем коммите на origin/main ===" && \
git diff --stat origin/main..HEAD 2>/dev/null | tail -5
```

---

## Рекомендуемый порядок действий

Чтобы понять «что из кода на GitHub, а что нет» и подготовить stage:

1. **Закрепить текущее состояние**
   - Решить, что из `??` и изменений действительно нужно в репо (документы, артефакты, бинарники часто оставляют вне Git или в `.gitignore`).
   - Добавить нужное: `git add …` или `git add .` (осторожно с большими/секретными файлами).
   - Сделать коммит на `auth-flow-fix`:  
     `git commit -m "ваше сообщение"`.

2. **Загрузить ветку на GitHub**
   - `git push -u origin auth-flow-fix`  
   После этого на GitHub появится ветка `auth-flow-fix`, и будет видно «что уже на GitHub» (main + auth-flow-fix).

3. **Определиться со stage**
   - **Вариант A.** Считать stage = ветка `auth-flow-fix`.  
     В Vercel в настройках проекта добавить ветку `auth-flow-fix` → все деплои с неё будут «stage».
   - **Вариант B.** Завести отдельную ветку `stage`:  
     `git checkout -b stage`  
     при необходимости слить в неё `auth-flow-fix`, затем:  
     `git push -u origin stage`  
     В Vercel повесить stage-домен/окружение на ветку `stage`.

4. **Проверять «что на GitHub» после каждого пуша**
   - `git fetch origin`  
   - `git log origin/main --oneline -3`   # последние коммиты в main  
   - `git log origin/auth-flow-fix --oneline -3`  # после того как запушен auth-flow-fix  

---

## Что уже не попадает в Git (.gitignore)

Сейчас в проекте в `.gitignore` среди прочего:

- `node_modules/`, `.next/`, сборки
- `.env`, `.env*.local`
- `.vercel`
- большие PDF: `*.pdf`, `litrature/**/*.pdf` (кроме нужных в `public/`)

Файлы и папки под этими правилами в `git status` не попадут в «отслеживаемые», даже если они есть только локально — это нормально.

---

## Однострочник для быстрой проверки «я впереди или сзади GitHub?»

```bash
git fetch origin 2>/dev/null; echo "Впереди origin/main: $(git rev-list --count origin/main..HEAD) коммитов"; echo "Позади origin/main: $(git rev-list --count HEAD..origin/main) коммитов"
```

После первого `git push -u origin auth-flow-fix` имеет смысл проверить и ветку `origin/auth-flow-fix` аналогично.
