# Приветственное видео: лимит превышен — что делать

Если при загрузке `welcome-video.mp4` в bucket пишет «File size exceeds the bucket upload limit», а через SQL лимит не меняется, возможно, ограничение задаётся на стороне Beget (nginx или переменная Storage). Разобрать именно Beget по шагам: **[docs/beget-storage-upload-limit.md](beget-storage-upload-limit.md)**.

Ниже — обходные пути без смены лимита (другой bucket или внешний хостинг).

---

## 1. Загрузить видео в тот же bucket, где грузятся МРТ

У вас в одном bucket загрузка больших файлов проходит, в другом — нет.

**Шаги:**

1. Откройте Storage в панели (или в том месте, где вы грузите МРТ).
2. Выберите **тот же bucket**, куда успешно загружаете МРТ.
3. Загрузите туда файл `welcome-video.mp4` (в корень или в папку, например `videos/`).
4. Скопируйте **публичный URL** этого файла. Формат обычно такой:
   ```text
   https://pooycaduebookel.beget.app/storage/v1/object/public/<ИМЯ_BUCKET>/welcome-video.mp4
   ```
   или с подпапкой:
   ```text
   https://pooycaduebookel.beget.app/storage/v1/object/public/<ИМЯ_BUCKET>/videos/welcome-video.mp4
   ```
5. В `.env.local` и в настройках деплоя (Vercel и т.п.) задайте:
   ```env
   WELCOME_VIDEO_URL=https://pooycaduebookel.beget.app/storage/v1/object/public/<ИМЯ_BUCKET>/videos/welcome-video.mp4
   ```
   Подставьте реальные `<ИМЯ_BUCKET>` и путь к файлу.

Сайт уже использует `WELCOME_VIDEO_URL` и проксирует поток через `/api/video/welcome-video`, менять код не нужно.

---

## 2. Взять видео с внешнего хостинга

Если ни в один bucket крупный файл загрузить нельзя, положите `welcome-video.mp4` на любой хостинг, который отдаёт **прямую ссылку на файл** (по URL сразу начинается загрузка/воспроизведение MP4, а не HTML-страница).

Примеры:

- Облако (Google Drive, Dropbox и т.п.) — только если вы используете «прямую» ссылку на сам файл, а не на страницу просмотра.
- Специальные сервисы: [streamable.com](https://streamable.com), [archive.org](https://archive.org) (загрузка видео → взять прямую ссылку на .mp4).
- Свой домен на том же Beget: положить файл в каталог сайта (например `public/welcome-video.mp4`) и использовать URL вида `https://ваш-сайт.ru/welcome-video.mp4`.

В `.env.local` и в деплое укажите этот URL в `WELCOME_VIDEO_URL`. Прокси в приложении будет стримить его как сейчас.

---

## 3. Уменьшить размер файла

Если лимит bucket небольшой и поменять его нельзя:

- Сожмите `welcome-video.mp4` до размера **меньше лимита** (например до 20–40 MB).
- Онлайн: [CloudConvert](https://cloudconvert.com/mp4-converter), [FreeConvert Video Compressor](https://www.freeconvert.com/video-compressor).
- С FFmpeg:
  ```bash
  ffmpeg -i welcome-video.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k welcome-video-small.mp4
  ```
- Загрузите получившийся файл в нужный bucket и обновите `WELCOME_VIDEO_URL`, чтобы он вёл на новый файл (тот же путь или новый, в зависимости от того, куда вы его положили).

---

## Кратко

| Ситуация | Действие |
|----------|----------|
| В другом bucket МРТ грузятся нормально | Загружайте `welcome-video.mp4` в **этот** bucket и в `WELCOME_VIDEO_URL` укажите его публичный URL. |
| Ни в один bucket большой файл не лезет | Либо сожмите видео (п. 3), либо залейте на внешний хостинг с прямой ссылкой и этот URL задайте в `WELCOME_VIDEO_URL` (п. 2). |

После смены `WELCOME_VIDEO_URL` перезапустите dev-сервер и при необходимости пересоберите/задеплойте приложение.
