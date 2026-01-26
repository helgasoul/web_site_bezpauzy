'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { User, Award, BookOpen, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface BookAuthorBioProps {}

export const BookAuthorBio: FC<BookAuthorBioProps> = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/project_experts.png"
          alt="Фон секции об авторе"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-bg/90 via-lavender-bg/80 to-lavender-bg/90" />
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Photo */}
            <motion.div
              className="relative order-2 md:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/puchkova-olga.png"
                  alt="Ольга Пучкова — автор книги"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="space-y-6 order-1 md:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full mb-4">
                <User className="w-4 h-4 text-primary-purple" />
                <span className="text-body-small font-semibold text-primary-purple">
                  Об авторе
                </span>
              </div>

              <h2 className="text-h2 font-bold text-deep-navy mb-4">
                Ольга Пучкова
              </h2>

              <p className="text-body-large text-deep-navy/80 mb-4">
                Автор книги &quot;Менопауза: Новое видение&quot;, создатель проекта Без |Паузы
              </p>

              <div className="space-y-4 text-body text-deep-navy/70">
                <p>
                  Эта книга родилась из желания помочь женщинам понять свое тело и перестать бояться менопаузы. 
                  У меня было много пациентов, проходящих этот период, и я знаю, насколько важно иметь научно обоснованную информацию, 
                  поданную доступным языком.
                </p>
                <p>
                  В книге собраны современные научные данные, проверенные врачами, и представлены так, 
                  чтобы каждая женщина могла понять, что происходит с ее телом и почему.
                </p>
                <p className="font-semibold text-deep-navy">
                  &quot;Понимание трансформирует опыт. Когда мы понимаем, мы перестаем бояться.&quot;
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-body-small text-deep-navy/70">
                  <Award className="w-4 h-4 text-primary-purple" />
                  <span>Основатель проекта Без |Паузы</span>
                </div>
                <div className="flex items-center gap-2 text-body-small text-deep-navy/70">
                  <BookOpen className="w-4 h-4 text-primary-purple" />
                  <span>100+ научных источников</span>
                </div>
              </div>

              {/* Interviews & Media Links */}
              <div className="mt-8 pt-8 border-t border-deep-navy/10">
                <h3 className="text-h5 font-semibold text-deep-navy mb-4">
                  Интервью и публикации
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <a
                    href="https://snob.ru/profile/32128/blog/1007545/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-body-small text-primary-purple hover:text-ocean-wave-start hover:underline transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">Snob.ru блог</span>
                  </a>
                  <a
                    href="https://news.itmo.ru/ru/news/13518/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-body-small text-primary-purple hover:text-ocean-wave-start hover:underline transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">Новости ИТМО</span>
                  </a>
                  <a
                    href="https://t-j.ru/list/mammography/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-body-small text-primary-purple hover:text-ocean-wave-start hover:underline transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">T-J.ru о маммографии</span>
                  </a>
                  <a
                    href="https://femtechforce.mave.digital/ep-51"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-body-small text-primary-purple hover:text-ocean-wave-start hover:underline transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">Подкаст FemTech Force</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

