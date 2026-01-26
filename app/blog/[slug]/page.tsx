import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { ArticleHeader } from '@/components/blog/ArticleHeader'
import { RelatedArticles } from '@/components/blog/RelatedArticles'
import { NewsletterSubscription } from '@/components/blog/NewsletterSubscription'
import { BackButton } from '@/components/ui/BackButton'
import { StructuredData } from '@/components/seo/StructuredData'
import { getArticleBySlug } from '@/lib/blog/get-articles'
import { getCategoryName } from '@/lib/utils/blog'
import { generateArticleSchema, generateBreadcrumbListSchema } from '@/lib/seo/schema'
import { assetUrl } from '@/lib/assets'

export const dynamic = 'force-dynamic'

// Динамический импорт клиентских компонентов с framer-motion
const EnhancedArticleContent = dynamicImport(
  () => import('@/components/blog/EnhancedArticleContent').then(mod => ({ default: mod.EnhancedArticleContent })),
  { ssr: true }
)

const AskEvaWidget = dynamicImport(
  () => import('@/components/ui/AskEvaWidget').then(mod => ({ default: mod.AskEvaWidget })),
  { ssr: false }
)

/**
 * Генерация мета-тегов для статьи
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Статья не найдена | Без |Паузы',
      description: 'Запрашиваемая статья не найдена',
    }
  }

  const categoryName = article.categoryName || getCategoryName(article.category)
  const metaTitle = article.metaTitle || article.title
  const metaDescription = article.metaDescription || article.excerpt
  const keywords = article.metaKeywords || [categoryName, 'менопауза', 'климакс', 'женское здоровье']

  // Формируем URL изображения для Open Graph (поддержка Supabase Storage через assetUrl)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
  const relPath = article.image || '/og-default.png'
  const imageUrl = relPath.startsWith('http')
    ? relPath
    : (assetUrl(relPath).startsWith('http') ? assetUrl(relPath) : siteUrl + assetUrl(relPath))

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/blog/${article.slug}`

  return {
    title: `${metaTitle} | Без |Паузы`,
    description: metaDescription,
    keywords: keywords,
    authors: article.authorName ? [{ name: article.authorName }] : undefined,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      url: articleUrl,
      publishedTime: article.publishedAt || undefined,
      authors: article.authorName ? [article.authorName] : undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    // Twitter Cards оставлены для совместимости, но основной фокус на Telegram и VK
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    // Дополнительные мета-теги для Telegram и VK
    other: {
      'telegram:channel': '@bezpauzi',
    },
  }
}

/**
 * Генерация статических путей для статей (опционально, для ISR)
 */
export async function generateStaticParams() {
  // Можно добавить предзагрузку популярных статей
  // Пока оставляем динамическую генерацию
  return []
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Преобразуем данные из Supabase в формат, ожидаемый компонентами
  const categoryName = article.categoryName || getCategoryName(article.category)
  
  // Формируем объект автора (avatar через assetUrl для Supabase Storage)
  const author = {
    name: article.authorName || 'Автор',
    role: article.authorRole || 'Эксперт',
    avatar: assetUrl(article.authorAvatar || '/hero-women.jpg'),
  }

  // Формируем объект статьи для компонентов
  const articleForComponents = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    categoryName: categoryName,
    author: author,
    publishedAt: article.publishedAt || article.createdAt,
    updatedAt: article.updatedAt,
    readTime: article.readTime,
    image: assetUrl(article.image || '/article_1.png'),
    content: article.content,
    keyTakeaways: article.keyTakeaways,
    articleReferences: article.articleReferences,
  }

  // Генерация структурированных данных
  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.excerpt || article.metaDescription || '',
    image: article.image || '/og-default.png',
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    authorName: article.authorName || 'Автор',
    authorRole: article.authorRole || 'Эксперт',
    url: `/blog/${article.slug}`,
  })

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Журнал', url: '/blog' },
    { name: categoryName, url: `/blog?category=${article.category}` },
    { name: article.title, url: `/blog/${article.slug}` },
  ]
  const breadcrumbSchema = generateBreadcrumbListSchema(breadcrumbs)

  return (
    <>
      <StructuredData data={[articleSchema, breadcrumbSchema]} />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <ArticleHeader article={articleForComponents} />
      <EnhancedArticleContent article={articleForComponents} />
      <RelatedArticles currentSlug={article.slug} category={article.category} />
      <NewsletterSubscription />
      <AskEvaWidget articleTitle={article.title} articleSlug={article.slug} />
    </>
  )
}
