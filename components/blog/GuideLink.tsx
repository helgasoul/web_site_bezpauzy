'use client'

import { FC, useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import { GuidePreviewModal } from './GuidePreviewModal'

interface GuideLinkProps {
  guideName: string
  guideSlug?: string
}

/**
 * Маппинг названий гайдов в тексте на их slug в базе данных
 */
const GUIDE_NAME_TO_SLUG: Record<string, string> = {
  'Кожа и слизистые в менопаузе — от науки к практике': 'skin-mucous-membranes-menopause-guide',
  'Выпадение волос в менопаузе — от науки к практике': 'hair-loss-menopause-guide',
  'кожа и слизистые в менопаузе — от науки к практике': 'skin-mucous-membranes-menopause-guide',
  'выпадение волос в менопаузе — от науки к практике': 'hair-loss-menopause-guide',
  'кожа и слизистые': 'skin-mucous-membranes-menopause-guide',
  'выпадение волос': 'hair-loss-menopause-guide',
  'hair-loss-menopause-guide': 'hair-loss-menopause-guide',
  'skin-mucous-membranes-menopause-guide': 'skin-mucous-membranes-menopause-guide',
}

/**
 * Находит slug гайда по названию
 */
function findGuideSlug(guideName: string): string | null {
  // Проверяем точное совпадение
  const exactMatch = GUIDE_NAME_TO_SLUG[guideName]
  if (exactMatch) return exactMatch

  // Проверяем частичное совпадение
  for (const [name, slug] of Object.entries(GUIDE_NAME_TO_SLUG)) {
    if (guideName.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(guideName.toLowerCase())) {
      return slug
    }
  }

  return null
}

export const GuideLink: FC<GuideLinkProps> = ({ guideName, guideSlug }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actualSlug, setActualSlug] = useState<string | null>(null)

  useEffect(() => {
    if (guideSlug) {
      setActualSlug(guideSlug)
    } else if (guideName) {
      const foundSlug = findGuideSlug(guideName)
      setActualSlug(foundSlug)
    }
  }, [guideName, guideSlug])

  if (!actualSlug) {
    // Если slug не найден, показываем обычный текст без ссылки
    return <strong className="font-semibold text-deep-navy">{guideName}</strong>
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 font-semibold text-primary-purple hover:text-primary-purple/80 transition-colors cursor-pointer group"
      >
        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="underline decoration-2 underline-offset-2">
          {guideName}
        </span>
        <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      {actualSlug && (
        <GuidePreviewModal
          guideSlug={actualSlug}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
