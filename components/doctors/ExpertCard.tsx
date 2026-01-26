'use client'

import { FC, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Stethoscope, Heart, Apple } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ConsultationConsentModal } from '@/components/doctors/ConsultationConsentModal'

interface ExpertCardProps {
  expert: {
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
  index: number
}

const iconMap = {
  heart: Heart,
  stethoscope: Stethoscope,
  apple: Apple,
}

/** Единственный источник правды: роль → путь страницы эксперта (должен совпадать с app/experts/[category]) */
const ROLE_TO_EXPERT_PATH: Record<string, string> = {
  'Маммолог': '/experts/mammologist',
  'Гинеколог': '/experts/gynecologist',
  'Нутрициолог': '/experts/nutritionist',
}

const ROLE_TO_CATEGORY: Record<string, 'mammologist' | 'gynecologist' | 'nutritionist'> = {
  'Маммолог': 'mammologist',
  'Гинеколог': 'gynecologist',
  'Нутрициолог': 'nutritionist',
}

export const ExpertCard: FC<ExpertCardProps> = ({ expert, index }) => {
  const Icon = iconMap[expert.iconName]
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false)

  // Определяем ссылку на бота в зависимости от роли эксперта
  const getBotLink = () => {
    if (expert.role === 'Маммолог') {
      return 'https://t.me/bezpauzy_bot?start=consultation_mammologist'
    }
    if (expert.role === 'Гинеколог') {
      return 'https://t.me/bezpauzy_bot?start=consultation_gynecologist'
    }
    if (expert.role === 'Нутрициолог') {
      return 'https://t.me/bezpauzy_bot?start=consultation_nutritionist'
    }
    return 'https://t.me/bezpauzy_bot'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg flex flex-col h-full"
    >
      {/* Header with photo - увеличенная высота для полного фото */}
      <div 
        className={`relative w-full h-[600px] overflow-hidden ${
          expert.iconBgClass === 'bg-primary-purple' 
            ? 'bg-gradient-to-br from-primary-purple via-primary-purple/80 to-primary-purple/60'
            : expert.iconBgClass === 'bg-ocean-wave-start'
            ? 'bg-gradient-to-br from-ocean-wave-start via-ocean-wave-start/80 to-ocean-wave-start/60'
            : 'bg-gradient-to-br from-warm-accent via-warm-accent/80 to-warm-accent/60'
        }`}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }} />
        </div>
        
        {/* Photo if available */}
        {expert.image ? (
          <div className="absolute inset-0">
            <Image
              src={expert.image}
              alt={expert.name}
              fill
              className="object-cover"
              style={{ objectPosition: 'center top' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          /* Fallback градиент если нет фото */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 ${expert.iconBgClass} rounded-full flex items-center justify-center shadow-2xl`}>
              <Icon className="w-16 h-16 text-white" />
            </div>
          </div>
        )}
        
        {/* Small icon badge in corner */}
        <div className={`absolute top-6 right-6 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 z-10`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Expert info section - между фото и описанием */}
      <div className={`px-6 pt-6 pb-4 text-center ${expert.iconBgClass === 'bg-primary-purple' ? 'bg-primary-purple/5' : expert.iconBgClass === 'bg-ocean-wave-start' ? 'bg-ocean-wave-start/5' : 'bg-warm-accent/5'}`}>
        {/* Large icon */}
        <div className={`w-20 h-20 ${expert.iconBgClass} rounded-full flex items-center justify-center shadow-2xl mb-4 ring-4 ring-white/30 mx-auto`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        
        {/* Name */}
        <h3 className="text-h3 font-bold text-deep-navy mb-2">
          {expert.name}
        </h3>
        
        {/* Specialization */}
        <p className="text-body-large text-deep-navy/70">
          {expert.specialization}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col h-full">
        <div className="mb-3">
          <span className={`inline-block px-4 py-1.5 ${expert.badgeBgClass} ${expert.badgeTextClass} text-sm font-semibold rounded-full mb-4`}>
            {expert.role}
          </span>
          <p className="text-body text-deep-navy/85 mb-6 leading-relaxed flex-1">
            {expert.description}
          </p>
        </div>
        <div className="space-y-3 pt-4 border-t border-lavender-bg">
          <Link
            href={ROLE_TO_EXPERT_PATH[expert.role] ?? '/doctors'}
            className="block"
            prefetch={false}
          >
            <Button variant="primary" className="w-full">
              Подробнее об эксперте
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setIsConsentModalOpen(true)}
          >
            Записаться на консультацию
          </Button>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsultationConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        expertName={expert.name}
        expertRole={expert.role}
        expertCategory={ROLE_TO_CATEGORY[expert.role] ?? 'mammologist'}
        botLink={getBotLink()}
      />
    </motion.div>
  )
}

