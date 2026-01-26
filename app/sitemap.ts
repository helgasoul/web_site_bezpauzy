import { MetadataRoute } from 'next'
import { getPublishedArticles } from '@/lib/blog/get-articles'
import { getPodcastEpisodes, getEvaExplainsVideos } from '@/lib/supabase/video'
import { knowledgeBaseConfig } from '@/lib/knowledge-base/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/book`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/book/chapters`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/book/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/knowledge-base`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/podcasts/nopause`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/videos/eva-explains`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/doctors`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/bot`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/resources/guides`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/resources/checklists`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Динамические страницы: только если Supabase доступен при сборке (чтобы сборка не падала без env)
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  let blogPages: MetadataRoute.Sitemap = []
  if (hasSupabase) {
    try {
      const articles = await getPublishedArticles()
      blogPages = articles.map((article) => ({
        url: `${SITE_URL}/blog/${article.slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    } catch (error) {
      console.error('Error fetching blog articles for sitemap:', error)
    }
  }

  let podcastPages: MetadataRoute.Sitemap = []
  if (hasSupabase) {
    try {
      const { data: podcasts } = await getPodcastEpisodes()
      podcastPages = (podcasts || []).map((podcast) => ({
        url: `${SITE_URL}/podcasts/nopause/${podcast.slug}`,
        lastModified: podcast.updated_at ? new Date(podcast.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    } catch (error) {
      console.error('Error fetching podcasts for sitemap:', error)
    }
  }

  let videoPages: MetadataRoute.Sitemap = []
  if (hasSupabase) {
    try {
      const { data: videos } = await getEvaExplainsVideos()
      videoPages = (videos || []).map((video) => ({
        url: `${SITE_URL}/videos/eva-explains/${video.slug}`,
        lastModified: video.updated_at ? new Date(video.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    } catch (error) {
      console.error('Error fetching videos for sitemap:', error)
    }
  }

  // Динамические страницы: категории базы знаний
  const knowledgeBaseCategoryPages: MetadataRoute.Sitemap = knowledgeBaseConfig.map((category) => ({
    url: `${SITE_URL}/knowledge-base/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Объединяем все страницы
  return [
    ...staticPages,
    ...blogPages,
    ...podcastPages,
    ...videoPages,
    ...knowledgeBaseCategoryPages,
  ]
}

