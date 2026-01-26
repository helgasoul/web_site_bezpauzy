'use client'

import { FC, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { 
  ArrowRight, 
  Calendar, 
  FileText, 
  Video, 
  GraduationCap, 
  Award,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/ui/BackButton'
import { ConsultationConsentModal } from '@/components/doctors/ConsultationConsentModal'
import type { ExpertPageData } from '@/lib/experts/get-expert-data'

interface ExpertPageProps {
  expertData: ExpertPageData
}

export const ExpertPage: FC<ExpertPageProps> = ({ expertData }) => {
  const { expert, articles, videos } = expertData
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false)

  // Логирование для отладки - проверяем данные эксперта
  if (typeof window !== 'undefined') {
    console.log('ExpertPage expert data:', {
      name: expert.name,
      category: expert.category,
      hasImage: !!expert.image,
      image: expert.image,
      hasCv: !!expert.cv,
      hasBio: !!expert.bio,
      cvLength: expert.cv?.length || 0,
      cvPreview: expert.cv?.substring(0, 100) || 'no CV',
    })
  }

  const getCategoryColors = () => {
    switch (expert.category) {
      case 'gynecologist':
        return {
          bg: 'bg-gradient-to-br from-ocean-wave-start via-ocean-wave-start/80 to-ocean-wave-end/60',
          badge: 'bg-ocean-wave-start/10 text-ocean-wave-start',
          icon: 'bg-ocean-wave-start',
        }
      case 'mammologist':
        return {
          bg: 'bg-gradient-to-br from-primary-purple via-primary-purple/80 to-primary-purple/60',
          badge: 'bg-primary-purple/10 text-primary-purple',
          icon: 'bg-primary-purple',
        }
      case 'nutritionist':
        return {
          bg: 'bg-gradient-to-br from-warm-accent via-warm-accent/80 to-warm-accent/60',
          badge: 'bg-warm-accent/10 text-warm-accent',
          icon: 'bg-warm-accent',
        }
    }
  }

  const colors = getCategoryColors()

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>

      {/* Hero Section with Expert Info */}
      <section className={`relative py-16 md:py-24 ${colors.bg} overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Expert Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className={`inline-block px-5 py-2.5 ${colors.badge} rounded-full font-semibold mb-6`}>
                {expert.category_name}
              </span>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                {expert.name}
              </h1>

              <p className="text-2xl md:text-3xl text-white/90 mb-6 drop-shadow-md">
                {expert.specialization}
              </p>

              <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {expert.description}
              </p>

              {/* CTA Button */}
              <Button
                variant="primary"
                onClick={() => setIsConsentModalOpen(true)}
                className="bg-white text-primary-purple hover:bg-white/90 px-8 py-6 text-lg font-semibold flex items-center gap-3"
              >
                <Calendar className="w-5 h-5" />
                <span>Записаться на консультацию</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Right: Expert Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                  {expert.image ? (
                    <Image
                      src={expert.image}
                      alt={expert.name}
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center top' }}
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />
                  ) : (
                    <div className={`w-full h-full ${colors.bg} flex items-center justify-center`}>
                      <GraduationCap className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CV Section */}
      {expert.cv || expert.bio ? (
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-soft-white via-lavender-bg/30 to-soft-white overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-purple rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-ocean-wave-start rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Section Header with gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className={`relative bg-gradient-to-br rounded-2xl p-6 md:p-8 shadow-card overflow-hidden ${
                  expert.category === 'gynecologist'
                    ? 'from-ocean-wave-start via-ocean-wave-start/90 to-ocean-wave-end'
                    : expert.category === 'mammologist'
                    ? 'from-primary-purple via-primary-purple/90 to-ocean-wave-start'
                    : 'from-warm-accent via-warm-accent/90 to-primary-purple/80'
                }`}>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
                                        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                    }} />
                  </div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className={`${colors.icon} rounded-xl p-3 shadow-lg ring-4 ring-white/20`}>
                      <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-h2 md:text-h1 font-bold text-white mb-2">
                        Портфолио
                      </h2>
                      <p className="text-body-large text-white/90">
                        Профессиональный путь и достижения
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* CV Content Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-lavender-bg/50"
              >
                {/* Decorative top border */}
                <div className={`h-1 bg-gradient-to-r ${
                  expert.category === 'gynecologist'
                    ? 'from-ocean-wave-start via-ocean-wave-end to-primary-purple'
                    : expert.category === 'mammologist'
                    ? 'from-primary-purple via-ocean-wave-start to-ocean-wave-end'
                    : 'from-warm-accent via-primary-purple to-ocean-wave-start'
                }`} />
                
                <div className="p-8 md:p-12 lg:p-16">
                  {expert.cv_html ? (
                    <div
                      className="prose prose-lg max-w-none prose-headings:text-deep-navy prose-headings:font-bold prose-h2:text-h2 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-lavender-bg prose-h3:text-h3 prose-h3:mt-8 prose-h3:mb-4 prose-p:text-deep-navy/80 prose-p:text-body prose-p:mb-6 prose-ul:list-none prose-ul:pl-0 prose-ul:mb-6 prose-li:text-deep-navy/80 prose-li:text-body prose-li:mb-3 prose-strong:text-deep-navy prose-strong:font-semibold"
                      dangerouslySetInnerHTML={{ __html: expert.cv_html }}
                    />
                  ) : expert.cv ? (
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({ children }: any) => (
                            <h2 className="text-h2 font-bold text-deep-navy mt-12 mb-6 pb-4 border-b-2 border-lavender-bg/50 first:mt-0 flex items-center gap-3">
                              <div className={`w-1 h-8 ${colors.icon} rounded-full`} />
                              <span>{children}</span>
                            </h2>
                          ),
                          h3: ({ children }: any) => {
                            const gradientClass = expert.category === 'gynecologist' 
                              ? 'bg-gradient-to-b from-ocean-wave-start to-ocean-wave-end'
                              : expert.category === 'mammologist'
                              ? 'bg-gradient-to-b from-primary-purple to-ocean-wave-start'
                              : 'bg-gradient-to-b from-warm-accent to-primary-purple'
                            return (
                              <h3 className="text-h3 font-bold text-deep-navy mt-8 mb-4 flex items-center gap-2">
                                <div className={`w-1.5 h-6 ${gradientClass} rounded-full`} />
                                <span>{children}</span>
                              </h3>
                            )
                          },
                          p: ({ children }: any) => (
                            <p className="text-body text-deep-navy/80 mb-6 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }: any) => (
                            <ul className="list-none pl-0 mb-8 space-y-3">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }: any) => (
                            <ol className="list-decimal pl-6 mb-8 space-y-3">
                              {children}
                            </ol>
                          ),
                          li: ({ children }: any) => (
                            <li className="text-body text-deep-navy/80 flex items-start gap-3 group">
                              <div className={`mt-2 w-2 h-2 rounded-full ${colors.icon} flex-shrink-0 group-hover:scale-125 transition-transform duration-200`} />
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          strong: ({ children }: any) => (
                            <strong className="font-semibold text-deep-navy bg-lavender-bg/50 px-1.5 py-0.5 rounded">
                              {children}
                            </strong>
                          ),
                          em: ({ children }: any) => (
                            <em className="italic text-deep-navy/90">{children}</em>
                          ),
                        } as any}
                      >
                        {expert.cv.trim()}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-body-large text-deep-navy/80 leading-relaxed">{expert.bio}</p>
                    </div>
                  )}
                </div>

                {/* Decorative bottom accent */}
                <div className="h-px bg-gradient-to-r from-transparent via-lavender-bg to-transparent" />
              </motion.div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Articles Section */}
      {articles.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-h2 font-bold text-deep-navy flex items-center gap-3">
                <BookOpen className={`w-8 h-8 ${colors.icon} text-white rounded-lg p-1.5`} />
                Статьи ({articles.length})
              </h2>
              <Link href="/blog">
                <Button variant="secondary" className="hidden md:inline-flex">
                  Все статьи →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative w-full h-64 overflow-hidden bg-lavender-bg">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-deep-navy/60 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-h5 font-bold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-body-small text-deep-navy/70 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-deep-navy/60">
                        <span>
                          {new Date(article.published_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {article.read_time && (
                          <span>{article.read_time} мин чтения</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="py-16 md:py-24 bg-lavender-bg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-h2 font-bold text-deep-navy flex items-center gap-3">
                <Video className={`w-8 h-8 ${colors.icon} text-white rounded-lg p-1.5`} />
                Видео с участием ({videos.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video, index) => {
                const videoUrl =
                  video.content_type === 'eva_explains'
                    ? `/videos/eva-explains/${video.slug}`
                    : `/videos/podcasts/${video.slug}`

                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={videoUrl}
                      className="group block bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative w-full h-48 overflow-hidden bg-lavender-bg">
                        <Image
                          src={video.thumbnail_url}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-primary-purple" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-lavender-bg text-primary-purple rounded-full font-medium">
                            {video.content_type === 'podcast' ? 'Подкаст' : 'Ева объясняет'}
                          </span>
                        </div>
                        <h3 className="text-h5 font-bold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-body-small text-deep-navy/70 line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h2 md:text-h1 font-bold text-white mb-8">
              Готовы начать?
            </h2>
            <Button
              variant="primary"
              onClick={() => setIsConsentModalOpen(true)}
              className="bg-white text-primary-purple hover:bg-white/90 px-10 py-6 text-lg font-semibold flex items-center gap-3 mx-auto"
            >
              <Calendar className="w-5 h-5" />
              <span>Записаться на консультацию</span>
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Consultation Consent Modal */}
      <ConsultationConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        expertName={expert.name}
        expertRole={expert.role}
        expertCategory={expert.category}
        botLink={expert.telegram_bot_link || `https://t.me/bezpauzy_bot?start=consultation_${expert.category}`}
      />
    </main>
  )
}

