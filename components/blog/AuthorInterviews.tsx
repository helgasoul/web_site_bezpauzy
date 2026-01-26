'use client'

import { FC } from 'react'
import { ExternalLink, PenTool, GraduationCap, Microscope, Video } from 'lucide-react'

interface AuthorInterviewsProps {
  authorName: string
}

export const AuthorInterviews: FC<AuthorInterviewsProps> = ({ authorName }) => {
  // Показываем ссылки только для Пучковой Ольги
  if (authorName !== 'Пучкова Ольга' && authorName !== 'Ольга Пучкова') {
    return null
  }

  const interviews = [
    {
      href: 'https://snob.ru/profile/32128/blog/1007545/',
      title: 'Snob.ru блог',
      icon: PenTool,
    },
    {
      href: 'https://news.itmo.ru/ru/news/13518/',
      title: 'Новости ИТМО',
      icon: GraduationCap,
    },
    {
      href: 'https://t-j.ru/list/mammography/',
      title: 'T-J.ru о маммографии',
      icon: Microscope,
    },
  ]

  const podcast = {
    href: 'https://femtechforce.mave.digital/ep-51',
    title: 'Подкаст FemTech Force',
    icon: Video,
  }

  return (
    <div className="mt-8 pt-8 border-t border-lavender-bg">
      <h3 className="text-h5 font-semibold text-deep-navy mb-4">
        Интервью и публикации автора
      </h3>
      <div className="space-y-3">
        {interviews.map((interview) => {
          const Icon = interview.icon
          return (
            <a
              key={interview.href}
              href={interview.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-body-small text-primary-purple hover:text-ocean-wave-start hover:underline transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-purple/10 rounded-lg flex items-center justify-center group-hover:bg-primary-purple/20 transition-colors">
                <Icon className="w-4 h-4 text-primary-purple" />
              </div>
              <span>{interview.title}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          )
        })}
        <a
          href={podcast.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-body-small text-primary-purple hover:text-ocean-wave-start hover:underline transition-colors group mt-4 pt-4 border-t border-lavender-bg"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-lg flex items-center justify-center group-hover:from-primary-purple/30 group-hover:to-ocean-wave-start/30 transition-colors">
            <Video className="w-4 h-4 text-primary-purple" />
          </div>
          <span className="font-medium">{podcast.title}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  )
}
