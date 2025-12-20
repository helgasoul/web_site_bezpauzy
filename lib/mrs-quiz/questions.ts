import type { MRSQuestion } from '@/lib/types/mrs-quiz'

export const MRS_QUESTIONS: MRSQuestion[] = [
  {
    id: 'hot_flashes',
    number: 1,
    category: 'somatic',
    question: 'Приливы жара и потливость',
    description: 'Внезапные ощущения жара, особенно в области лица и груди, сопровождающиеся потливостью'
  },
  {
    id: 'heart_discomfort',
    number: 2,
    category: 'somatic',
    question: 'Сердцебиение и проблемы со сном',
    description: 'Учащённое сердцебиение, ощущение перебоев в работе сердца, трудности с засыпанием или пробуждения'
  },
  {
    id: 'sleep_problems',
    number: 3,
    category: 'somatic',
    question: 'Нарушения сна',
    description: 'Проблемы с засыпанием, частые пробуждения, ранние пробуждения, неглубокий сон'
  },
  {
    id: 'depressive_mood',
    number: 4,
    category: 'psychological',
    question: 'Подавленное настроение',
    description: 'Чувство грусти, печали, отсутствие интереса к жизни, чувство безнадёжности'
  },
  {
    id: 'irritability',
    number: 5,
    category: 'psychological',
    question: 'Раздражительность',
    description: 'Повышенная чувствительность, вспыльчивость, раздражение по мелочам'
  },
  {
    id: 'anxiety',
    number: 6,
    category: 'psychological',
    question: 'Тревога',
    description: 'Беспокойство, чувство страха, внутреннее напряжение, ощущение опасности'
  },
  {
    id: 'physical_mental_exhaustion',
    number: 7,
    category: 'psychological',
    question: 'Физическая и умственная усталость',
    description: 'Чувство истощения, недостаток энергии, трудности с концентрацией внимания'
  },
  {
    id: 'sexual_problems',
    number: 8,
    category: 'urogenital',
    question: 'Проблемы с половой жизнью',
    description: 'Снижение либидо, боль при половом акте, отсутствие удовольствия'
  },
  {
    id: 'bladder_problems',
    number: 9,
    category: 'urogenital',
    question: 'Проблемы с мочевым пузырём',
    description: 'Учащённое мочеиспускание, недержание мочи, частые позывы, инфекции мочевыводящих путей'
  },
  {
    id: 'vaginal_dryness',
    number: 10,
    category: 'urogenital',
    question: 'Сухость влагалища',
    description: 'Сухость, зуд, жжение во влагалище, дискомфорт'
  },
  {
    id: 'joint_muscle_pain',
    number: 11,
    category: 'somatic',
    question: 'Боли в суставах и мышцах',
    description: 'Боли в суставах, мышечные боли, скованность, дискомфорт при движении'
  }
]

export const MRS_OPTIONS = [
  { value: 0, label: 'Нет симптомов', description: 'Симптома нет' },
  { value: 1, label: 'Лёгкие симптомы', description: 'Симптом есть, но не мешает' },
  { value: 2, label: 'Умеренные симптомы', description: 'Симптом заметен и иногда мешает' },
  { value: 3, label: 'Сильные симптомы', description: 'Симптом сильно мешает' },
  { value: 4, label: 'Очень сильные симптомы', description: 'Симптом очень сильно мешает, невозможно терпеть' }
]

