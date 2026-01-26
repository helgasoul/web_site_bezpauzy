import type { Metadata } from 'next'
import { ExpertCard } from '@/components/doctors/ExpertCard'
import { ExpertsHero } from '@/components/doctors/ExpertsHero'
import { ExpertsCTA } from '@/components/doctors/ExpertsCTA'
import { StructuredData } from '@/components/seo/StructuredData'
import { generatePersonSchema } from '@/lib/seo/schema'
import { BackButton } from '@/components/ui/BackButton'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

export const metadata: Metadata = {
  title: 'Эксперты проекта | Без |Паузы',
  description: 'Наши эксперты: маммолог, гинеколог и нутрициолог помогут вам на пути к здоровью в менопаузе.',
  keywords: ['эксперты менопаузы', 'маммолог', 'гинеколог', 'нутрициолог', 'врачи менопаузы'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/doctors`,
  },
  openGraph: {
    title: 'Эксперты проекта | Без |Паузы',
    description: 'Наши эксперты помогут вам на пути к здоровью в менопаузе',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/doctors`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

interface Expert {
  id: number
  name: string
  specialization: string
  role: string
  description: string
  image?: string // Optional - если нет фото, используется градиент
  iconName: 'heart' | 'stethoscope' | 'apple'
  badgeBgClass: string
  badgeTextClass: string
  iconBgClass: string
}

const experts: Expert[] = [
  {
    id: 1,
    name: 'Пучкова Ольга',
    specialization: 'Маммолог-онколог, врач-рентгенолог, сертифицированный специалист EUSOBI',
    role: 'Маммолог',
    description: 'Ведущий маммолог-онколог с опытом более 20 лет. Единственный в России врач, сертифицированный Европейской ассоциацией радиологов EUSOBI. Руководитель Маммологического центра К+31. Соавтор книг профессора László Tabár — мирового эксперта в диагностике рака молочной железы. Прошла стажировки в Швеции (центр им. Tabar), Израиле (Hadassah Medical Center), обучалась у ведущих международных специалистов. Эксперт государственной программы скрининга рака молочной железы. Специализируется на ранней диагностике с использованием маммографии, УЗИ, МРТ и томосинтеза.',
    image: '/puchkova-olga.png',
    iconName: 'heart',
    badgeBgClass: 'bg-primary-purple/10',
    badgeTextClass: 'text-primary-purple',
    iconBgClass: 'bg-primary-purple',
  },
  {
    id: 2,
    name: 'Шамугия Натия',
    specialization: 'Гинеколог-эндокринолог, кандидат медицинских наук',
    role: 'Гинеколог',
    description: 'Кандидат медицинских наук с опытом более 13 лет. Защитила диссертацию под руководством академика РАН, профессора Л.В. Адамян. Практикует в ведущих клиниках Москвы: Ильинская больница, Клиника Чайка. Эксперт в области менопаузальной гормональной терапии и anti-aging терапии. Международный диплом по эндоскопической хирургии (Université d\'Auvergne, Франция). Автор более 10 научных публикаций. Специализируется на индивидуальном подборе ЗГТ, эндоскопической хирургии, лечении миомы матки органосохраняющими методами. Помогает женщинам разобраться в симптомах менопаузы и найти оптимальное решение для сохранения качества жизни.',
    image: '/shamugia-natiya.jpg',
    iconName: 'stethoscope',
    badgeBgClass: 'bg-ocean-wave-start/10',
    badgeTextClass: 'text-ocean-wave-start',
    iconBgClass: 'bg-ocean-wave-start',
  },
  {
    id: 3,
    name: 'Климкова Марина',
    specialization: 'Врач превентивной, интегративной и anti-age медицины, Нутрициолог, диетолог',
    role: 'Нутрициолог',
    description: 'Врач с уникальным опытом более 20 лет, объединяющий клиническую медицину и превентивный подход. Международный диплом по нутрициологии (Leibniz Institute of Nutrition, Germany) — одно из ведущих научных учреждений Европы. Выпускница PreventAge Institute, специалист по медицине долголетия (Diploma in Longevity Medicine, 2024). Практикует в клиниках EMC, МЕДСИ, Патера, К+31. Единственный врач в России, сочетающий знания кардиологии, лучевой диагностики, нутрициологии и биохимии в холистическом подходе. Создаёт индивидуальные стратегии здоровья, учитывающие взаимодействие гормонов, питания, нервной системы и образа жизни. Помогает женщинам вернуть энергию, контроль веса и предотвратить возрастные изменения.',
    image: '/marina-klimkova.jpg',
    iconName: 'apple',
    badgeBgClass: 'bg-warm-accent/10',
    badgeTextClass: 'text-warm-accent',
    iconBgClass: 'bg-warm-accent',
  },
]

export default function DoctorsPage() {
  // Генерация Person schema для каждого эксперта
  const personSchemas = experts.map((expert) =>
    generatePersonSchema({
      name: expert.name,
      jobTitle: expert.role,
      description: expert.description,
      url: `/doctors`,
    })
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <StructuredData data={personSchemas} />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <ExpertsHero />

      {/* Experts Grid */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {experts.map((expert, index) => (
              <ExpertCard key={expert.id} expert={expert} index={index} />
            ))}
          </div>
        </div>
      </section>

      <ExpertsCTA />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <MedicalDisclaimer variant="full" />
      </div>
    </main>
  )
}

