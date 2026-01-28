# Доступ к файлам: Storage и ресурсы

## Две разные вещи

### 1. Файлы в Supabase Storage (bucket)

Картинки, видео, PDF из бывшей папки `public/` лежат в bucket (например `public-assets`). Чтобы сайт их подхватывал:

- **Картинки и статика:** в `.env.local` и на Vercel задай  
  `NEXT_PUBLIC_ASSETS_BASE_URL=https://<проект>.supabase.co/storage/v1/object/public/public-assets`  
  (подставь свой проект и имя bucket).

- **Приветственное видео:** задайте **`NEXT_PUBLIC_WELCOME_VIDEO_URL`** — плеер грузит файл по этой ссылке в браузере. На проде (Vercel и т.п.) добавьте ту же переменную в настройках.
  ```env
  NEXT_PUBLIC_WELCOME_VIDEO_URL=https://<проект>.supabase.co/storage/v1/object/public/public-assets/welcome-video.mp4
  ```
  Опционально: `WELCOME_VIDEO_URL` с тем же значением — тогда API `/api/video/welcome-video` проксирует поток, если клиент не использует прямую ссылку. Файл должен открываться в браузере по этому URL.

### 2. Ресурсы (гайды/чек-листы) в базе

Сообщение **«Ресурс "..." не найден»** при оформлении заказа значит: в таблице **`menohub_resources`** в Supabase нет строки с таким же `slug`, как у товара в корзине.

Это не про файлы в bucket, а про записи в БД:

1. Открой Supabase → **Table Editor** → таблица **`menohub_resources`**.
2. Посмотри, есть ли строка с названием ресурса из ошибки (например «Наука о волосах: Доказанные методы для женщин в менопаузе»).
3. Если нет — создай запись с полями `title`, `slug`, `published`, `is_paid`, `price_kopecks` и т.п., как у других платных ресурсов.
4. Убедись, что `slug` в этой записи совпадает с тем, что уходит в корзину (часто это slug из URL страницы ресурса).

Файл PDF/EPUB для скачивания может лежать в Storage, но заказ создаётся только по записи в `menohub_resources`.

---

### Видео в Storage, но ошибка «файл не найден» остаётся

Если `welcome-video.mp4` уже залит в Storage, а на сайте по-прежнему «Ошибка загрузки видео / файл не найден», проверьте по порядку:

1. **Где смотрите сайт**
   - **Локально** — в `.env.local` задайте `NEXT_PUBLIC_WELCOME_VIDEO_URL=<полный URL файла>` (и при необходимости `WELCOME_VIDEO_URL` с тем же значением). После изменений перезапустите dev-сервер (`npm run dev`).
   - **На проде (Vercel и т.п.)** — в настройках проекта добавьте **`NEXT_PUBLIC_WELCOME_VIDEO_URL`** с URL файла и задеплойте заново. Без этой переменной на проде видео не подгружается.

2. **Работает ли URL**
   - Скопируйте значение `NEXT_PUBLIC_WELCOME_VIDEO_URL` (или `WELCOME_VIDEO_URL`) и откройте в браузере в новой вкладке.
   - Должно начаться воспроизведение или скачивание. Если видите **404** и `{"error":"not_found","message":"Object not found"}` — **файла по этому пути нет**. Нужно загрузить его в Storage и подставить в переменные **тот URL, который даёт сам Storage** после загрузки.

3. **404 «Object not found» — файла по этому пути нет**
   - Сообщение `{"statusCode":"404","error":"not_found","message":"Object not found"}` значит: по адресу `.../public-assets/welcome-video.mp4` объект не лежит (bucket другой, папка другая или файл ещё не загружен).
   - **Что сделать:**
     1. Откройте Storage в панели Beget/Supabase (тот же проект, что отдаёт `pooycaduebookel.beget.app`).
     2. Выберите bucket **`public-assets`** (или тот, у которого публичный URL вида `.../storage/v1/object/public/<имя_bucket>/...`).
     3. Загрузите файл **`welcome-video.mp4`** в корень bucket или в папку (например `videos/`). Если срабатывает лимит размера — сожмите видео или используйте другой bucket (см. [docs/welcome-video-limit-workaround.md](docs/welcome-video-limit-workaround.md)).
     4. После загрузки откройте файл в интерфейсе Storage и скопируйте **публичный URL** (или соберите его вручную: `https://pooycaduebookel.beget.app/storage/v1/object/public/<имя_bucket>/<путь>/welcome-video.mp4`).
     5. Вставьте **этот точный URL** в `NEXT_PUBLIC_WELCOME_VIDEO_URL` и `WELCOME_VIDEO_URL` в `.env.local` и в настройках деплоя (Vercel). Перезапустите dev и пересоберите прод.
   - Проверка: снова откройте этот URL в браузере — должно начаться воспроизведение или скачивание, без 404.

4. **Доступность Supabase/Beget**
   - Если Supabase на Beget был в статусе «Off», включите его (Enable). Пока сервер выключен, запрос к этому URL будет падать с ошибкой.

## Кратко

| Ошибка | Что проверить |
|--------|----------------|
| Видео не загружается / welcome-video не найден | `NEXT_PUBLIC_WELCOME_VIDEO_URL` в .env и на Vercel; файл должен реально лежать в Storage по этому URL |
| 404 «Object not found» по URL видео | Файла по этому пути нет — загрузите `welcome-video.mp4` в bucket и подставьте в переменные URL из Storage (см. раздел «404 Object not found» выше) |
| Видео уже в Storage, но «файл не найден» не исчезает | Ниже раздел **«Видео в Storage, но ошибка остаётся»** |
| «File size exceeds the bucket upload limit» при загрузке видео | На Beget: [docs/beget-storage-upload-limit.md](docs/beget-storage-upload-limit.md). Обход без смены лимита: [docs/welcome-video-limit-workaround.md](docs/welcome-video-limit-workaround.md) |
| Картинки не грузятся | `NEXT_PUBLIC_ASSETS_BASE_URL` в .env и на Vercel |
| «Ресурс "..." не найден» при оплате | Наличие и `slug` записи в таблице `menohub_resources` в Supabase |
