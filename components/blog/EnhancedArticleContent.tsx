'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { KeyTakeaways } from './KeyTakeaways'
import { References } from './References'
import { parseArticleContent } from './ArticleContentParser'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'
import { SaveToCollectionButton } from '@/components/ui/SaveToCollectionButton'
import { ShareButtons } from '@/components/ui/ShareButtons'

interface Article {
  id: string | number
  title: string
  slug: string
  content: string
  keyTakeaways?: string[] | null
  articleReferences?: Array<{ id: number; text: string }> | null
  references?: Array<{ id: number; text: string }> // Для обратной совместимости
  category?: string
}

interface ArticleContentProps {
  article: Article
}

export const EnhancedArticleContent: FC<ArticleContentProps> = ({ article }) => {
  // Parse content using the improved parser with article context
  const contentElements = parseArticleContent(article.content, {
    articleTitle: article.title,
    articleSlug: article.slug,
  })

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="mb-12">
              <KeyTakeaways takeaways={article.keyTakeaways} />
            </div>
          )}

          {/* Article Body */}
          <article className="prose prose-lg max-w-none">
            <div className="article-content">
              {contentElements}
            </div>
          </article>

          {/* References */}
          {article.articleReferences && article.articleReferences.length > 0 && (
            <div className="mt-16">
              <References references={article.articleReferences} />
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="mt-12">
            <MedicalDisclaimer variant="full" />
          </div>

          {/* Action Buttons: Save to Collection and Ask Eva */}
          <div className="mt-12 space-y-6">
            {/* Save to Collection Button */}
            <div className="flex justify-center">
              <SaveToCollectionButton
                contentType="article"
                contentId={article.slug}
                title={article.title}
                url={`/blog/${article.slug}`}
                metadata={{
                  category: article.category,
                }}
              />
            </div>

            {/* Ask Eva Button */}
            <div className="flex justify-center">
              <Link href="/bot">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    inline-flex items-center gap-3
                    px-8 py-4
                    bg-gradient-to-r from-primary-purple to-ocean-wave-start
                    text-white font-semibold rounded-xl
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                  "
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Спросить Еву</span>
                </motion.button>
              </Link>
            </div>

            <p className="text-center text-body-small text-deep-navy/60 max-w-md mx-auto">
              Задайте любой вопрос о менопаузе и здоровье Еве в чате — она ответит с учётом вашей ситуации на основе научных источников.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
