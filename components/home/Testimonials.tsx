import { getFeaturedTestimonials } from '@/lib/supabase/testimonial'
import type { Testimonial } from '@/lib/types/testimonial'
import { TestimonialsClient } from './TestimonialsClient'

interface TestimonialsProps {}

// Fallback данные на случай отсутствия отзывов в БД
const fallbackTestimonials = [
  {
    quote: 'Ева помогла мне понять, что происходит с моим телом. Теперь я знаю, что делать.',
    author_name: 'Анна, 48 лет, Москва',
    iconName: 'User' as const,
    gradient: 'from-primary-purple to-ocean-wave-start',
  },
  {
    quote: 'Наконец-то нашла научно обоснованную информацию о менопаузе. Спасибо!',
    author_name: 'Елена, 52 года, СПб',
    iconName: 'Heart' as const,
    gradient: 'from-warm-accent to-primary-purple',
  },
  {
    quote: 'Ассистент Ева стал моим постоянным помощником. Очень удобно и информативно.',
    author_name: 'Светлана, 45 лет, Казань',
    iconName: 'Star' as const,
    gradient: 'from-ocean-wave-start to-warm-accent',
  },
]

// Функция для выбора имени иконки на основе данных (возвращает строку, а не компонент)
const getIconName = (index: number, testimonial?: Testimonial): 'User' | 'Heart' | 'Star' => {
  if (testimonial?.author_role?.toLowerCase().includes('врач') || testimonial?.author_role?.toLowerCase().includes('эксперт')) {
    return 'Heart'
  }
  if (testimonial?.rating && testimonial.rating >= 5) {
    return 'Star'
  }
  const iconNames: ('User' | 'Heart' | 'Star')[] = ['User', 'Heart', 'Star']
  return iconNames[index % iconNames.length]
}

// Функция для выбора градиента
const getGradient = (index: number) => {
  const gradients = [
    'from-primary-purple to-ocean-wave-start',
    'from-warm-accent to-primary-purple',
    'from-ocean-wave-start to-warm-accent',
  ]
  return gradients[index % gradients.length]
}

// Функция для форматирования имени автора
const formatAuthorName = (testimonial: Testimonial): string => {
  let name = testimonial.author_name
  if (testimonial.author_age) {
    name += `, ${testimonial.author_age} лет`
  }
  if (testimonial.author_location) {
    name += `, ${testimonial.author_location}`
  }
  return name
}

export async function Testimonials() {
  // Получаем отзывы из Supabase
  const { data: testimonials, error } = await getFeaturedTestimonials(3)

  // Используем данные из БД или fallback
  const displayTestimonials = testimonials && testimonials.length > 0
    ? testimonials.map((testimonial, index) => ({
        quote: testimonial.quote,
        author_name: formatAuthorName(testimonial),
        iconName: getIconName(index, testimonial), // Передаём строку вместо компонента
        gradient: getGradient(index),
        rating: testimonial.rating,
      }))
    : fallbackTestimonials

  return <TestimonialsClient testimonials={displayTestimonials} />
}
