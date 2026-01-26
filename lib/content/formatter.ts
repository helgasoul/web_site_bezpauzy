/**
 * Универсальная функция форматирования контента для публикации
 * Создает сообщения для Telegram и email
 */

interface ContentItem {
  type: 'blog' | 'video' | 'resource'
  title: string
  slug: string
  description?: string
  excerpt?: string
  image?: string
  category?: string
  author?: string
  url?: string // Если указан, используется вместо построения из slug
}

/**
 * Форматирование сообщения для Telegram (бот и канал)
 */
export function formatTelegramMessage(content: ContentItem): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
  const botLink = 'https://t.me/bezpauzy_bot'

  let url = content.url || ''
  let emoji = ''
  let typeName = ''

  if (!url) {
    switch (content.type) {
      case 'blog':
        url = `${siteUrl}/blog/${content.slug}`
        break
      case 'video':
        url = `${siteUrl}/videos/eva-explains/${content.slug}`
        break
      case 'resource':
        url = `${siteUrl}/resources/${content.slug.includes('guide') ? 'guides' : 'checklists'}`
        break
    }
  }

  switch (content.type) {
    case 'blog':
      emoji = '📝'
      typeName = 'Новая статья'
      break
    case 'video':
      emoji = '🎥'
      typeName = 'Новое видео'
      break
    case 'resource':
      emoji = '📚'
      typeName = 'Новый гайд'
      break
  }

  const message = `
${emoji} <b>${typeName}</b>

<b>${content.title}</b>

${content.excerpt || content.description || ''}

${content.category ? `📂 ${content.category}` : ''}
${content.author ? `✍️ ${content.author}` : ''}

🔗 <a href="${url}">Читать на сайте</a>
💬 <a href="${botLink}">Обсудить с Евой</a>
  `.trim()

  return message
}

/**
 * Форматирование HTML для email рассылки
 */
export function formatEmailHTML(content: ContentItem): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
  const botLink = 'https://t.me/bezpauzy_bot'

  let url = content.url || ''
  let emoji = ''
  let typeName = ''

  if (!url) {
    switch (content.type) {
      case 'blog':
        url = `${siteUrl}/blog/${content.slug}`
        break
      case 'video':
        url = `${siteUrl}/videos/eva-explains/${content.slug}`
        break
      case 'resource':
        url = `${siteUrl}/resources/${content.slug.includes('guide') ? 'guides' : 'checklists'}`
        break
    }
  }

  switch (content.type) {
    case 'blog':
      emoji = '📝'
      typeName = 'Новая статья'
      break
    case 'video':
      emoji = '🎥'
      typeName = 'Новое видео'
      break
    case 'resource':
      emoji = '📚'
      typeName = 'Новый гайд'
      break
  }

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${emoji} ${typeName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e8e5f2; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1a1a2e; margin-top: 0; font-size: 22px;">${content.title}</h2>
    
    ${content.excerpt || content.description ? `<p style="color: #666; font-size: 16px;">${content.excerpt || content.description}</p>` : ''}
    
    ${content.image ? `<img src="${content.image.startsWith('http') ? content.image : siteUrl + content.image}" alt="${content.title}" style="width: 100%; border-radius: 8px; margin: 20px 0;">` : ''}
    
    <div style="margin: 30px 0;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-right: 10px;">
        Читать на сайте →
      </a>
      <a href="${botLink}" style="display: inline-block; background: #0088cc; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
        Обсудить с Евой →
      </a>
    </div>
    
    ${content.category ? `<p style="color: #8B7FD6; font-size: 14px; margin-top: 20px;">📂 ${content.category}</p>` : ''}
    ${content.author ? `<p style="color: #666; font-size: 14px;">✍️ ${content.author}</p>` : ''}
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e5f2; color: #999; font-size: 12px;">
    <p>Вы получили это письмо, потому что подписались на рассылку "Без |Паузы"</p>
    <p><a href="${siteUrl}/unsubscribe?token=UNSUBSCRIBE_TOKEN" style="color: #8B7FD6;">Отписаться от рассылки</a></p>
  </div>
</body>
</html>
  `.trim()

  return html
}

/**
 * Форматирование текстовой версии для email (fallback)
 */
export function formatEmailText(content: ContentItem): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
  const botLink = 'https://t.me/bezpauzy_bot'

  let url = content.url || ''
  let typeName = ''

  if (!url) {
    switch (content.type) {
      case 'blog':
        url = `${siteUrl}/blog/${content.slug}`
        break
      case 'video':
        url = `${siteUrl}/videos/eva-explains/${content.slug}`
        break
      case 'resource':
        url = `${siteUrl}/resources/${content.slug.includes('guide') ? 'guides' : 'checklists'}`
        break
    }
  }

  switch (content.type) {
    case 'blog':
      typeName = 'Новая статья'
      break
    case 'video':
      typeName = 'Новое видео'
      break
    case 'resource':
      typeName = 'Новый гайд'
      break
  }

  const text = `
${typeName}

${content.title}

${content.excerpt || content.description || ''}

${content.category ? `Категория: ${content.category}` : ''}
${content.author ? `Автор: ${content.author}` : ''}

Читать на сайте: ${url}
Обсудить с Евой: ${botLink}
  `.trim()

  return text
}

