import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCategoryName } from '@/lib/utils/blog'
import { faqData } from '@/lib/data/faq'

interface SearchResult {
  type: 'article' | 'knowledge' | 'faq'
  id: string
  title: string
  description: string
  url: string
  category?: string
}

// База знаний - статические страницы (можно расширить)
const knowledgeBasePages = [
  {
    id: 'hot-flashes',
    title: 'Приливы',
    description: 'Что такое приливы, почему они возникают и как их облегчить',
    url: '/knowledge-base/symptoms/hot-flashes',
    category: 'Симптомы',
  },
  {
    id: 'sleep',
    title: 'Сон в менопаузе',
    description: 'Проблемы со сном в период менопаузы и способы их решения',
    url: '/knowledge-base/symptoms/sleep',
    category: 'Симптомы',
  },
  {
    id: 'mood',
    title: 'Настроение',
    description: 'Изменения настроения в менопаузе и как с ними справляться',
    url: '/knowledge-base/symptoms/mood',
    category: 'Симптомы',
  },
  {
    id: 'libido',
    title: 'Либидо',
    description: 'Снижение либидо в менопаузе и пути решения',
    url: '/knowledge-base/symptoms/libido',
    category: 'Симптомы',
  },
  {
    id: 'weight',
    title: 'Вес и метаболизм',
    description: 'Изменения веса и метаболизма в период менопаузы',
    url: '/knowledge-base/symptoms/weight',
    category: 'Симптомы',
  },
  {
    id: 'skin-hair',
    title: 'Кожа и волосы',
    description: 'Изменения кожи и волос в менопаузе',
    url: '/knowledge-base/symptoms/skin-hair',
    category: 'Симптомы',
  },
  {
    id: 'bones-joints',
    title: 'Кости и суставы',
    description: 'Здоровье костей и суставов в менопаузе',
    url: '/knowledge-base/symptoms/bones-joints',
    category: 'Симптомы',
  },
  {
    id: 'heart-vessels',
    title: 'Сердце и сосуды',
    description: 'Сердечно-сосудистое здоровье в менопаузе',
    url: '/knowledge-base/symptoms/heart-vessels',
    category: 'Симптомы',
  },
  {
    id: 'perimenopause',
    title: 'Перименопауза',
    description: 'Что такое перименопауза и как она проявляется',
    url: '/knowledge-base/stages/perimenopause',
    category: 'Стадии',
  },
  {
    id: 'menopause',
    title: 'Менопауза',
    description: 'Менопауза: определение, симптомы и особенности',
    url: '/knowledge-base/stages/menopause',
    category: 'Стадии',
  },
  {
    id: 'postmenopause',
    title: 'Постменопауза',
    description: 'Постменопауза: что происходит после менопаузы',
    url: '/knowledge-base/stages/postmenopause',
    category: 'Стадии',
  },
  {
    id: 'hrt',
    title: 'Гормональная терапия (ЗГТ)',
    description: 'Заместительная гормональная терапия: показания и противопоказания',
    url: '/knowledge-base/treatment/hrt',
    category: 'Лечение',
  },
  {
    id: 'alternatives',
    title: 'Альтернативные методы',
    description: 'Немедикаментозные методы облегчения симптомов менопаузы',
    url: '/knowledge-base/treatment/alternatives',
    category: 'Лечение',
  },
  {
    id: 'lifestyle',
    title: 'Образ жизни',
    description: 'Как образ жизни влияет на течение менопаузы',
    url: '/knowledge-base/treatment/lifestyle',
    category: 'Лечение',
  },
]

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ё/g, 'е')
    .replace(/й/g, 'и')
}

function searchInText(text: string, query: string): boolean {
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)
  return normalizedText.includes(normalizedQuery)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim() || ''

    if (query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: SearchResult[] = []

    // Поиск по статьям (Supabase)
    try {
      const supabase = await createClient()
      const { data: articles, error } = await supabase
        .from('menohub_blog_posts')
        .select('id, title, slug, excerpt, category')
        .eq('published', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(50) // Получаем больше для фильтрации на стороне сервера

      if (!error && articles) {
        const matchingArticles = articles.filter((article) => {
          const titleMatch = searchInText(article.title, query)
          const excerptMatch = article.excerpt
            ? searchInText(article.excerpt, query)
            : false
          return titleMatch || excerptMatch
        })

        matchingArticles.slice(0, 10).forEach((article) => {
          results.push({
            type: 'article',
            id: article.id,
            title: article.title,
            description: article.excerpt || '',
            url: `/blog/${article.slug}`,
            category: getCategoryName(article.category as any),
          })
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error searching articles:', error)
      }
    }

    // Поиск по базе знаний
    const matchingKnowledge = knowledgeBasePages.filter((page) => {
      return (
        searchInText(page.title, query) ||
        searchInText(page.description, query)
      )
    })

    matchingKnowledge.slice(0, 5).forEach((page) => {
      results.push({
        type: 'knowledge',
        id: page.id,
        title: page.title,
        description: page.description,
        url: page.url,
        category: page.category,
      })
    })

    // Поиск по FAQ
    const matchingFAQ = faqData.filter((faq) => {
      return (
        searchInText(faq.question, query) ||
        searchInText(faq.answer, query)
      )
    })

    matchingFAQ.slice(0, 5).forEach((faq) => {
      results.push({
        type: 'faq',
        id: faq.id,
        title: faq.question,
        description: faq.answer.substring(0, 150) + '...',
        url: `/faq#${faq.id}`,
        category: faq.category,
      })
    })

    // Сортируем результаты: сначала статьи, потом база знаний, потом FAQ
    results.sort((a, b) => {
      const order = { article: 0, knowledge: 1, faq: 2 }
      return order[a.type] - order[b.type]
    })

    return NextResponse.json({ results: results.slice(0, 20) })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Search error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

