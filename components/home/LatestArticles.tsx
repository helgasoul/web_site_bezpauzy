import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { getPublishedArticles } from '@/lib/blog/get-articles'
import { getCategoryName, getCategoryOverlay } from '@/lib/utils/blog'
import type { BlogPost } from '@/lib/blog/get-articles'

interface LatestArticlesProps {}

export async function LatestArticles() {
  // Получаем последние 3 опубликованные статьи из Supabase
  const articles = await getPublishedArticles(3)

  // Если статей нет, показываем пустой блок или placeholder
  if (!articles || articles.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-lavender-bg">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-h2 font-bold text-deep-navy mb-12">
            Последние статьи из журнала
          </h2>
          <p className="text-body text-deep-navy/70">
            Статьи скоро появятся
          </p>
        </div>
      </section>
    )
  }

  // Маппим данные из БД в формат компонента
  const mappedArticles = articles.map((article: BlogPost, index: number) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || '',
    category: getCategoryName(article.category),
    slug: article.slug,
    image: article.image || '/article_1.png', // Fallback изображение
    overlay: getCategoryOverlay(article.category),
    isFirst: index === 0, // Для priority загрузки изображения
  }))

  return (
    <section className="py-16 md:py-24 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-h2 font-bold text-deep-navy">
            Последние статьи из журнала
          </h2>
          <Link href="/blog">
            <Button variant="secondary" className="hidden md:inline-flex">
              Все статьи →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mappedArticles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group"
            >
              <div className="bg-soft-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
                {/* Image with photo */}
                <div className="w-full h-72 md:h-80 relative overflow-hidden bg-lavender-bg">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={article.isFirst}
                  />
                  {/* Gradient overlay - только внизу для лучшей видимости фото */}
                  <div className={`absolute bottom-0 right-0 h-32 bg-gradient-to-t ${article.overlay}`} />
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-purple text-body-small font-semibold rounded-full shadow-md">
                      {article.category}
                    </span>
                  </div>
                  
                  {/* Wavy bottom edge */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-12 bg-soft-white z-10"
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% 85%, 95% 90%, 85% 92%, 75% 90%, 65% 88%, 55% 90%, 45% 92%, 35% 90%, 25% 88%, 15% 90%, 5% 88%, 0 85%)',
                    }}
                  />
                </div>

                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-primary-purple text-soft-white text-body-small font-medium rounded-pill mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-body-small text-deep-navy/70 line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/blog">
            <Button variant="secondary" className="w-full">
              Все статьи →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

