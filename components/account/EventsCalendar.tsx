'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Download, Clock, MapPin, ExternalLink, Mic, Video, BookOpen, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface PlatformEvent {
  id: string
  event_type: 'podcast' | 'webinar' | 'article' | 'course' | 'other'
  title: string
  description?: string
  event_date: string
  duration?: number // в минутах
  location?: string
  image_url?: string
  is_online: boolean
  registration_url?: string
  metadata?: Record<string, any>
}

interface EventsCalendarProps {
  userId?: string
}

export const EventsCalendar: FC<EventsCalendarProps> = ({ userId }) => {
  const [events, setEvents] = useState<PlatformEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка событий из API
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Получаем события на ближайшие 3 месяца
      const fromDate = new Date().toISOString().split('T')[0]
      const toDate = new Date()
      toDate.setMonth(toDate.getMonth() + 3)
      const toDateStr = toDate.toISOString().split('T')[0]

      const response = await fetch(`/api/events?from=${fromDate}&to=${toDateStr}`)
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить события')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке событий')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'podcast':
        return Mic
      case 'webinar':
        return Video
      case 'course':
        return BookOpen
      default:
        return CalendarIcon
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'podcast':
        return 'Подкаст'
      case 'webinar':
        return 'Вебинар'
      case 'article':
        return 'Статья'
      case 'course':
        return 'Курс'
      default:
        return 'Событие'
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Генерация ICS файла для Apple Calendar
  const generateICS = (event: PlatformEvent): string => {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const eventDate = new Date(event.event_date)
    const startDate = formatDate(eventDate)
    const endDate = event.duration
      ? formatDate(new Date(eventDate.getTime() + event.duration * 60000))
      : formatDate(new Date(eventDate.getTime() + 60 * 60000))

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Без |Паузы//Calendar//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      `UID:${event.id}@bezpauzy.com`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n')

    return icsContent
  }

  // Скачивание ICS файла
  const downloadICS = (event: PlatformEvent) => {
    const icsContent = generateICS(event)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Генерация URL для Google Calendar
  const getGoogleCalendarUrl = (event: PlatformEvent): string => {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const eventDate = new Date(event.event_date)
    const startDate = formatDate(eventDate)
    const endDate = event.duration
      ? formatDate(new Date(eventDate.getTime() + event.duration * 60000))
      : formatDate(new Date(eventDate.getTime() + 60 * 60000))

      const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || event.registration_url || '',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 border-2 border-lavender-bg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-primary-purple" />
          </div>
          <div>
            <h2 className="text-h3 font-bold text-deep-navy">Календарь событий</h2>
            <p className="text-sm text-deep-navy/60">События платформы Без |Паузы</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary-purple animate-spin mx-auto mb-4" />
          <p className="text-body text-deep-navy/70">Загрузка событий...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-lavender-bg mx-auto mb-4" />
          <p className="text-body text-deep-navy/70 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-6 py-3 bg-primary-purple text-white rounded-xl font-medium hover:bg-primary-purple/90 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-lavender-bg mx-auto mb-4" />
          <p className="text-body text-deep-navy/70 mb-4">
            На данный момент нет запланированных событий
          </p>
          <p className="text-sm text-deep-navy/50">
            Следите за обновлениями — мы регулярно добавляем новые подкасты и вебинары
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const EventIcon = getEventTypeIcon(event.event_type)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-lavender-bg rounded-xl p-4 border border-lavender-bg/50 hover:border-primary-purple/30 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  {event.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-primary-purple/10 text-primary-purple rounded-full text-xs font-semibold">
                        <EventIcon className="w-3 h-3" />
                        {getEventTypeLabel(event.event_type)}
                      </div>
                    </div>
                    <h3 className="text-h5 font-bold text-deep-navy mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-body-small text-deep-navy/70 mb-3">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-deep-navy/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatEventDate(event.event_date)}
                        {event.duration && ` (${event.duration} мин)`}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.is_online ? 'Онлайн' : event.location}
                        </span>
                      )}
                      {event.registration_url && (
                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-purple hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Зарегистрироваться
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-lavender-bg/50">
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-lavender-bg rounded-lg text-sm font-medium text-deep-navy hover:border-primary-purple/50 hover:text-primary-purple transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Google Calendar</span>
                  </a>
                  <button
                    onClick={() => downloadICS(event)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-lavender-bg rounded-lg text-sm font-medium text-deep-navy hover:border-primary-purple/50 hover:text-primary-purple transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Apple Calendar</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

    </motion.div>
  )
}

