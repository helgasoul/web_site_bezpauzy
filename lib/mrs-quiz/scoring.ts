import type { MRSAnswer, MRSResult, MRSSeverity } from '@/lib/types/mrs-quiz'

/**
 * Рассчитывает результат MRS квиза
 */
export function calculateMRSScore(answers: MRSAnswer): MRSResult {
  // Total score (0-44)
  const total_score = 
    answers.hot_flashes +
    answers.heart_discomfort +
    answers.sleep_problems +
    answers.depressive_mood +
    answers.irritability +
    answers.anxiety +
    answers.physical_mental_exhaustion +
    answers.sexual_problems +
    answers.bladder_problems +
    answers.vaginal_dryness +
    answers.joint_muscle_pain

  // Somatic score (hot_flashes + heart_discomfort + sleep_problems + joint_muscle_pain)
  const somatic_score = 
    answers.hot_flashes +
    answers.heart_discomfort +
    answers.sleep_problems +
    answers.joint_muscle_pain

  // Psychological score (depressive_mood + irritability + anxiety + physical_mental_exhaustion)
  const psychological_score = 
    answers.depressive_mood +
    answers.irritability +
    answers.anxiety +
    answers.physical_mental_exhaustion

  // Urogenital score (sexual_problems + bladder_problems + vaginal_dryness)
  const urogenital_score = 
    answers.sexual_problems +
    answers.bladder_problems +
    answers.vaginal_dryness

  // Vasomotor score (hot_flashes + heart_discomfort)
  const vasomotor_score = 
    answers.hot_flashes +
    answers.heart_discomfort

  // Determine severity
  const severity = determineSeverity(total_score)

  return {
    total_score,
    severity,
    vasomotor_score,
    somatic_score,
    psychological_score,
    urogenital_score
  }
}

/**
 * Определяет уровень тяжести симптомов
 */
function determineSeverity(total_score: number): MRSSeverity {
  if (total_score <= 4) return 'none'
  if (total_score <= 8) return 'mild'
  if (total_score <= 16) return 'moderate'
  if (total_score <= 26) return 'severe'
  return 'very_severe'
}

/**
 * Получить label для уровня тяжести
 */
export function getMRSSeverityLabel(severity: MRSSeverity): string {
  const labels: Record<MRSSeverity, string> = {
    none: 'Нет симптомов',
    mild: 'Лёгкие симптомы',
    moderate: 'Умеренные симптомы',
    severe: 'Сильные симптомы',
    very_severe: 'Очень сильные симптомы'
  }
  return labels[severity]
}

/**
 * Получить описание уровня тяжести
 */
export function getMRSSeverityDescription(severity: MRSSeverity): string {
  const descriptions: Record<MRSSeverity, string> = {
    none: 'Отлично! У вас практически нет симптомов менопаузы. Это означает, что ваш организм хорошо адаптируется к гормональным изменениям. Продолжайте поддерживать здоровый образ жизни.',
    mild: 'У вас лёгкие симптомы менопаузы. Они могут быть заметны, но обычно не сильно мешают повседневной жизни. Немедикаментозные методы (питание, физическая активность, управление стрессом) могут помочь.',
    moderate: 'У вас умеренные симптомы менопаузы. Они заметны и могут периодически мешать. Рекомендуется обсудить с врачом варианты лечения, включая ЗГТ, если симптомы влияют на качество жизни.',
    severe: 'У вас сильные симптомы менопаузы, которые значительно влияют на качество жизни. Настоятельно рекомендуется консультация с врачом для обсуждения вариантов лечения, включая ЗГТ.',
    very_severe: 'У вас очень сильные симптомы менопаузы, которые серьёзно влияют на вашу жизнь. Необходима консультация с врачом для оценки ситуации и подбора лечения. ЗГТ может быть особенно эффективна в вашем случае.'
  }
  return descriptions[severity]
}

/**
 * Получить цвет для уровня тяжести
 */
export function getMRSSeverityColor(severity: MRSSeverity): string {
  const colors: Record<MRSSeverity, string> = {
    none: 'from-success/20 to-success/10',
    mild: 'from-ocean-wave-start/20 to-ocean-wave-end/10',
    moderate: 'from-warning/20 to-warning/10',
    severe: 'from-warm-accent/20 to-warm-accent/10',
    very_severe: 'from-error/20 to-error/10'
  }
  return colors[severity]
}

/**
 * Получить emoji для уровня тяжести
 */
export function getMRSSeverityEmoji(severity: MRSSeverity): string {
  const emojis: Record<MRSSeverity, string> = {
    none: '🌟',
    mild: '✅',
    moderate: '⚠️',
    severe: '🔶',
    very_severe: '🔴'
  }
  return emojis[severity]
}

