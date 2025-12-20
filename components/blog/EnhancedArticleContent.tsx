'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { KeyTakeaways } from './KeyTakeaways'
import { References } from './References'
import { parseArticleContent } from './ArticleContentParser'

interface Article {
  id: number
  title: string
  slug: string
  content: string
  keyTakeaways: string[]
  references?: Array<{ id: number; text: string }>
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
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <KeyTakeaways takeaways={article.keyTakeaways} />
            </motion.div>
          )}

          {/* Article Body */}
          <motion.article
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="article-content">
              {contentElements}
            </div>
          </motion.article>

          {/* References */}
          {article.references && article.references.length > 0 && (
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <References references={article.references} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
