'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Headphones, Play } from 'lucide-react'

interface Podcast {
  id: string
  title: string
  description: string
  duration: string
  date: string
}

interface TopicPodcastsProps {
  podcastIds?: string[]
}

export const TopicPodcasts: FC<TopicPodcastsProps> = ({ podcastIds = [] }) => {
  // Пока заглушка, так как подкастов еще нет
  // В будущем здесь будет загрузка из базы данных
  
  if (!podcastIds || !Array.isArray(podcastIds) || podcastIds.length === 0) {
    return <></>
  }

  // Placeholder данные
  const podcasts: Podcast[] = []

  if (!podcasts || podcasts.length === 0) {
    return <></>
  }

  return (
    <section className="py-12 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2">Подкасты</h2>
          <p className="text-body text-deep-navy/70">
            Аудио-материалы и интервью с экспертами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {podcasts.map((podcast, index) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-soft-white rounded-card p-6 shadow-card border border-lavender-bg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                      {podcast.title}
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-3">
                      {podcast.description}
                    </p>
                    <div className="flex items-center gap-4 text-body-small text-deep-navy/60">
                      <span>{podcast.duration}</span>
                      <span>•</span>
                      <span>{podcast.date}</span>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary-purple text-white flex items-center justify-center hover:bg-primary-purple/90 transition-colors">
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

