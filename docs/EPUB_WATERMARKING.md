# Watermarking для EPUB файлов

## 📋 Обзор

Watermarking (цифровой водяной знак) помогает защитить контент от несанкционированного распространения и идентифицировать источник утечки.

---

## 🎯 Рекомендуемый подход: Метаданные EPUB (невидимый watermark)

**Что добавлять в метаданные:**

1. **Уникальный идентификатор покупки**
   - `dc:identifier` с UUID покупки
   - Пример: `urn:bezpauzy:purchase:abc123-def456-ghi789`

2. **Email покупателя (хешированный)**
   - SHA-256 хеш email для приватности
   - Пример: `purchaser-hash: a1b2c3d4e5f6...`

3. **Дата покупки**
   - `dc:date` с датой покупки
   - Пример: `2024-12-25T10:00:00Z`

4. **Кастомные метаданные**
   - `meta` теги с дополнительной информацией
   - Пример: `<meta name="purchase-id" content="uuid"/>`

**Преимущества:**
- ✅ Невидимый для пользователя
- ✅ Не портит внешний вид книги
- ✅ Легко извлечь программно
- ✅ Можно отследить источник утечки

---

## 🔧 Техническая реализация

### Библиотеки для работы с EPUB:

**JavaScript/TypeScript (рекомендуется):**
- `epubjs` - чтение EPUB
- `jszip` + ручное редактирование XML - редактирование EPUB
- `xml2js` - парсинг XML

**Python:**
- `ebooklib` - редактирование EPUB
- `epub` - работа с метаданными

**Рекомендация:** Использовать Node.js библиотеки (`jszip` + `xml2js`)

### Процесс генерации персонализированного EPUB:

```
1. Получить базовый EPUB файл из Supabase Storage
2. Распаковать EPUB (это ZIP архив)
3. Отредактировать metadata.opf (добавить метаданные)
4. Запаковать обратно в EPUB
5. Отдать пользователю
```

### Где хранить персонализированные EPUB:

**Вариант 1: Генерировать на лету при скачивании (рекомендуется)**
- ✅ Не занимает место
- ✅ Всегда актуальные метаданные
- ❌ Требует обработку при каждом скачивании

**Вариант 2: Генерировать один раз при покупке и хранить**
- ✅ Быстрое скачивание
- ❌ Занимает место в Storage
- ❌ Нужно хранить много файлов

**Рекомендация:** Вариант 1 (генерировать на лету)

---

## 📝 Структура метаданных EPUB

### Пример metadata.opf:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" 
         xmlns:dc="http://purl.org/dc/elements/1.1/"
         unique-identifier="purchase-id" 
         version="3.0">
  <metadata>
    <!-- Стандартные метаданные -->
    <dc:title>Противовоспалительное питание</dc:title>
    <dc:creator>Без |Паузы</dc:creator>
    <dc:language>ru</dc:language>
    <dc:date>2024-12-25</dc:date>
    
    <!-- Watermarking метаданные -->
    <dc:identifier id="purchase-id">urn:bezpauzy:purchase:abc123-def456-ghi789</dc:identifier>
    <dc:date opf:event="purchase">2024-12-25T10:00:00Z</dc:date>
    <meta property="purchaser-email-hash">a1b2c3d4e5f6...</meta>
    <meta property="purchase-id">abc123-def456-ghi789</meta>
    <meta property="purchase-date">2024-12-25T10:00:00Z</meta>
    <meta property="download-token">abc123-def456-ghi789</meta>
  </metadata>
  <!-- ... остальное содержимое ... -->
</package>
```

---

## 💻 Пример кода (Node.js)

```typescript
import JSZip from 'jszip'
import { parseString, Builder } from 'xml2js'
import crypto from 'crypto'

interface PurchaseData {
  purchaseId: string
  email: string
  purchaseDate: string
  downloadToken: string
}

async function generatePersonalizedEPUB(
  baseEPUBBuffer: Buffer,
  purchaseData: PurchaseData
): Promise<Buffer> {
  // 1. Распаковываем EPUB (это ZIP)
  const zip = await JSZip.loadAsync(baseEPUBBuffer)
  
  // 2. Находим файл metadata.opf
  const metadataFile = Object.keys(zip.files).find(
    file => file.endsWith('metadata.opf') || file.endsWith('package.opf')
  )
  
  if (!metadataFile) {
    throw new Error('Metadata file not found in EPUB')
  }
  
  // 3. Читаем и парсим XML
  const metadataXml = await zip.file(metadataFile)!.async('string')
  const parser = new parseString.Parser()
  const metadata = await parser.parseStringPromise(metadataXml)
  
  // 4. Хешируем email
  const emailHash = crypto
    .createHash('sha256')
    .update(purchaseData.email)
    .digest('hex')
  
  // 5. Добавляем watermarking метаданные
  if (!metadata.package.metadata) {
    metadata.package.metadata = [{}]
  }
  
  const meta = metadata.package.metadata[0]
  
  // Добавляем purchase_id как dc:identifier
  if (!meta['dc:identifier']) {
    meta['dc:identifier'] = []
  }
  meta['dc:identifier'].push({
    _: `urn:bezpauzy:purchase:${purchaseData.purchaseId}`,
    $: { id: 'purchase-id' }
  })
  
  // Добавляем дату покупки
  if (!meta['dc:date']) {
    meta['dc:date'] = []
  }
  meta['dc:date'].push({
    _: purchaseData.purchaseDate,
    $: { 'opf:event': 'purchase' }
  })
  
  // Добавляем кастомные метаданные
  if (!meta.meta) {
    meta.meta = []
  }
  meta.meta.push(
    { $: { property: 'purchaser-email-hash' }, _: emailHash },
    { $: { property: 'purchase-id' }, _: purchaseData.purchaseId },
    { $: { property: 'purchase-date' }, _: purchaseData.purchaseDate },
    { $: { property: 'download-token' }, _: purchaseData.downloadToken }
  )
  
  // 6. Собираем XML обратно
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  })
  const newMetadataXml = builder.buildObject(metadata)
  
  // 7. Обновляем файл в ZIP
  zip.file(metadataFile, newMetadataXml)
  
  // 8. Генерируем новый EPUB
  return await zip.generateAsync({ type: 'nodebuffer' })
}
```

---

## 🔒 Безопасность

### Защита от удаления watermark:

1. **Хеширование email**
   - Не хранить email в открытом виде
   - Использовать SHA-256 хеш
   - Можно восстановить по хешу из БД

2. **Множественные места**
   - Добавлять метаданные в несколько мест
   - В metadata.opf
   - В content.opf (если есть)

3. **Логирование**
   - Логировать все попытки скачивания
   - Сохранять IP, user agent
   - Отслеживать подозрительную активность

---

## 📊 Отслеживание утечек

### Если файл попал в открытый доступ:

1. **Извлечь метаданные из EPUB**
2. **Найти purchase_id в БД**
3. **Идентифицировать покупателя**
4. **Принять меры** (блокировка, предупреждение)

### Инструменты для извлечения:

```typescript
async function extractWatermark(epubFile: Buffer) {
  const zip = await JSZip.loadAsync(epubFile)
  const metadataFile = Object.keys(zip.files).find(
    file => file.endsWith('metadata.opf')
  )
  
  if (!metadataFile) return null
  
  const metadataXml = await zip.file(metadataFile)!.async('string')
  const parser = new parseString.Parser()
  const metadata = await parser.parseStringPromise(metadataXml)
  
  const purchaseId = metadata.package?.metadata?.[0]?.['dc:identifier']?.[0]?._ || 
                     metadata.package?.metadata?.[0]?.meta?.find(
                       (m: any) => m.$.property === 'purchase-id'
                     )?._ || null
  
  return { purchaseId }
}
```

---

## ✅ Рекомендации

1. **Использовать метаданные** (невидимый watermark)
2. **Добавлять уникальный purchase_id** в каждую копию
3. **Хешировать email** для приватности
4. **Генерировать EPUB на лету** при скачивании
5. **Логировать все скачивания** для отслеживания

---

## 📚 Полезные ссылки

- [EPUB 3.0 Specification](https://www.w3.org/publishing/epub3/)
- [EPUB Metadata Guide](https://www.w3.org/publishing/epub32/epub-spec.html#sec-metadata-elem)
- [JSZip Documentation](https://stuk.github.io/jszip/)
- [xml2js Documentation](https://github.com/Leonidas-from-XIV/node-xml2js)

