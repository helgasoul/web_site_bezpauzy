import type { InflammationQuestion } from '@/lib/types/inflammation-quiz'

// Демографические вопросы
export const DEMOGRAPHICS_QUESTIONS: InflammationQuestion[] = [
  {
    id: 'age_range',
    number: 0,
    category: 'demographics',
    question: 'Ваш возраст',
    type: 'select',
    options: [
      { value: '35-39', label: '35-39 лет' },
      { value: '40-44', label: '40-44 года' },
      { value: '45-49', label: '45-49 лет' },
      { value: '50-54', label: '50-54 года' },
      { value: '55-59', label: '55-59 лет' },
      { value: '60+', label: '60+ лет' }
    ]
  },
  {
    id: 'height_cm',
    number: 1,
    category: 'demographics',
    question: 'Ваш рост (см)',
    description: 'Например: 165',
    type: 'number',
    validation: { min: 100, max: 250 }
  },
  {
    id: 'weight_kg',
    number: 2,
    category: 'demographics',
    question: 'Ваш вес (кг)',
    description: 'Например: 65',
    type: 'number',
    validation: { min: 30, max: 300 }
  },
  {
    id: 'waist_circumference_cm',
    number: 3,
    category: 'demographics',
    question: 'Окружность талии (см)',
    description: 'Измерьте на уровне пупка. Если не знаете точно, можете пропустить',
    type: 'number',
    validation: { min: 50, max: 200 }
  }
]

// Вопросы о питании (15 вопросов)
export const DIET_QUESTIONS: InflammationQuestion[] = [
  {
    id: 'diet_leafy_greens',
    number: 4,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Как часто вы едите листовую зелень или крестоцветные овощи?',
    description: 'Шпинат, капуста, брокколи, руккола, салаты',
    type: 'radio',
    options: [
      { value: -2, label: 'Каждый день или почти каждый день' },
      { value: -1, label: '4-6 раз в неделю' },
      { value: 0, label: '2-3 раза в неделю' },
      { value: 1, label: '1 раз в неделю или реже' },
      { value: 2, label: 'Никогда или почти никогда' }
    ]
  },
  {
    id: 'diet_berries',
    number: 5,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Как часто вы едите ягоды?',
    description: 'Черника, клубника, малина, ежевика (свежие или замороженные)',
    type: 'radio',
    options: [
      { value: -2, label: 'Каждый день' },
      { value: -1, label: '4-6 раз в неделю' },
      { value: 0, label: '2-3 раза в неделю' },
      { value: 1, label: '1 раз в неделю' },
      { value: 2, label: 'Реже 1 раза в неделю или никогда' }
    ]
  },
  {
    id: 'diet_fatty_fish',
    number: 6,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Сколько порций жирной рыбы вы едите в неделю?',
    description: 'Лосось, скумбрия, сардины, сельдь (источники омега-3)',
    type: 'radio',
    options: [
      { value: -2, label: '3+ порции' },
      { value: -1, label: '2 порции' },
      { value: 0, label: '1 порция' },
      { value: 1, label: 'Меньше 1 порции' },
      { value: 2, label: 'Не ем рыбу' }
    ]
  },
  {
    id: 'diet_nuts',
    number: 7,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Как часто вы едите орехи?',
    description: 'Грецкие орехи, миндаль, фундук (около 30г = горсть)',
    type: 'radio',
    options: [
      { value: -2, label: 'Каждый день' },
      { value: -1, label: '4-6 раз в неделю' },
      { value: 0, label: '2-3 раза в неделю' },
      { value: 1, label: '1 раз в неделю' },
      { value: 2, label: 'Реже или никогда' }
    ]
  },
  {
    id: 'diet_olive_oil',
    number: 8,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Какое масло вы чаще всего используете для готовки и заправки салатов?',
    type: 'radio',
    options: [
      { value: -2, label: 'Оливковое масло extra virgin', description: 'Нерафинированное' },
      { value: -1, label: 'Масло авокадо или льняное' },
      { value: 0, label: 'Не использую масло' },
      { value: 1, label: 'Растительное (подсолнечное, кукурузное)' },
      { value: 2, label: 'Сливочное масло или маргарин' }
    ]
  },
  {
    id: 'diet_whole_grains',
    number: 9,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Как часто вы едите цельнозерновые продукты?',
    description: 'Овсянка, киноа, бурый рис, цельнозерновой хлеб',
    type: 'radio',
    options: [
      { value: -2, label: 'Каждый день' },
      { value: -1, label: '4-6 раз в неделю' },
      { value: 0, label: '2-3 раза в неделю' },
      { value: 1, label: '1 раз в неделю' },
      { value: 2, label: 'Реже или никогда' }
    ]
  },
  {
    id: 'diet_legumes',
    number: 10,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Как часто вы едите бобовые?',
    description: 'Чечевица, нут, фасоль, горох',
    type: 'radio',
    options: [
      { value: -2, label: '3+ раза в неделю' },
      { value: -1, label: '2 раза в неделю' },
      { value: 0, label: '1 раз в неделю' },
      { value: 1, label: 'Несколько раз в месяц' },
      { value: 2, label: 'Реже или никогда' }
    ]
  },
  {
    id: 'diet_turmeric_spices',
    number: 11,
    category: 'diet',
    subcategory: 'anti_inflammatory',
    question: 'Как часто вы используете противовоспалительные специи?',
    description: 'Куркума, имбирь, чеснок, корица',
    type: 'radio',
    options: [
      { value: -2, label: 'Каждый день или почти каждый день' },
      { value: -1, label: 'Несколько раз в неделю' },
      { value: 0, label: '1 раз в неделю' },
      { value: 1, label: 'Несколько раз в месяц' },
      { value: 2, label: 'Редко или никогда' }
    ]
  },
  {
    id: 'diet_processed_meat',
    number: 12,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Как часто вы едите обработанное мясо?',
    description: 'Колбасы, сосиски, бекон, ветчина',
    type: 'radio',
    options: [
      { value: 3, label: 'Каждый день или почти каждый день' },
      { value: 2, label: '4-6 раз в неделю' },
      { value: 1, label: '2-3 раза в неделю' },
      { value: 0, label: '1 раз в неделю' },
      { value: -1, label: 'Реже 1 раза в неделю или никогда' }
    ]
  },
  {
    id: 'diet_red_meat',
    number: 13,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Как часто вы едите красное мясо?',
    description: 'Говядина, свинина, баранина',
    type: 'radio',
    options: [
      { value: 2, label: 'Каждый день или почти каждый день' },
      { value: 1, label: '4-6 раз в неделю' },
      { value: 0, label: '2-3 раза в неделю' },
      { value: -1, label: '1 раз в неделю или реже' },
      { value: -1, label: 'Не ем красное мясо' }
    ]
  },
  {
    id: 'diet_refined_carbs',
    number: 14,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Как часто вы едите рафинированные углеводы?',
    description: 'Белый хлеб, выпечка, белый рис, паста из белой муки',
    type: 'radio',
    options: [
      { value: 3, label: 'Несколько раз в день' },
      { value: 2, label: 'Каждый день' },
      { value: 1, label: '4-6 раз в неделю' },
      { value: 0, label: '2-3 раза в неделю' },
      { value: -1, label: 'Реже или никогда' }
    ]
  },
  {
    id: 'diet_sugary_drinks',
    number: 15,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Сколько сладких напитков или соков вы пьёте в день?',
    description: 'Газировка, пакетированные соки, сладкий чай/кофе',
    type: 'radio',
    options: [
      { value: 3, label: '3+ стакана' },
      { value: 2, label: '2 стакана' },
      { value: 1, label: '1 стакан' },
      { value: 0, label: 'Несколько раз в неделю' },
      { value: -1, label: 'Никогда' }
    ]
  },
  {
    id: 'diet_fried_foods',
    number: 16,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Как часто вы едите жареную пищу или фаст-фуд?',
    description: 'Картофель фри, чипсы, жареное во фритюре',
    type: 'radio',
    options: [
      { value: 3, label: '4+ раза в неделю' },
      { value: 2, label: '2-3 раза в неделю' },
      { value: 1, label: '1 раз в неделю' },
      { value: 0, label: 'Несколько раз в месяц' },
      { value: -1, label: 'Редко или никогда' }
    ]
  },
  {
    id: 'diet_alcohol',
    number: 17,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Сколько алкоголя вы употребляете в неделю?',
    description: '1 порция = 150мл вина или 350мл пива или 45мл крепкого',
    type: 'radio',
    options: [
      { value: 3, label: 'Более 14 порций' },
      { value: 2, label: '8-14 порций' },
      { value: 1, label: '4-7 порций' },
      { value: 0, label: '1-3 порции' },
      { value: 0, label: 'Не употребляю' }
    ]
  },
  {
    id: 'diet_trans_fats',
    number: 18,
    category: 'diet',
    subcategory: 'pro_inflammatory',
    question: 'Как часто вы едите продукты с трансжирами?',
    description: 'Маргарин, магазинная выпечка, готовые соусы',
    type: 'radio',
    options: [
      { value: 2, label: 'Часто (несколько раз в неделю)' },
      { value: 1, label: 'Иногда (1 раз в неделю)' },
      { value: 0, label: 'Редко (несколько раз в месяц)' },
      { value: -1, label: 'Никогда или почти никогда' },
      { value: -1, label: 'Не знаю, что такое трансжиры' }
    ]
  }
]

// Вопросы об образе жизни (7 вопросов)
export const LIFESTYLE_QUESTIONS: InflammationQuestion[] = [
  {
    id: 'lifestyle_physical_activity',
    number: 19,
    category: 'lifestyle',
    subcategory: 'exercise',
    question: 'Сколько минут в неделю вы занимаетесь физической активностью?',
    description: 'Ходьба, бег, плавание, йога, силовые тренировки - любая активность',
    type: 'radio',
    options: [
      { value: 2, label: 'Менее 30 минут' },
      { value: 1, label: '30-150 минут' },
      { value: 0, label: '150-300 минут' },
      { value: -1, label: 'Более 300 минут' },
      { value: -2, label: 'Регулярно: кардио + силовые тренировки (3+ раза в неделю)' }
    ]
  },
  {
    id: 'lifestyle_sleep_duration',
    number: 20,
    category: 'lifestyle',
    subcategory: 'sleep',
    question: 'Сколько часов вы спите в сутки в среднем?',
    type: 'radio',
    options: [
      { value: 2, label: 'Менее 6 часов' },
      { value: 1, label: '6-7 часов' },
      { value: -1, label: '7-9 часов' },
      { value: 0, label: 'Более 9 часов' }
    ]
  },
  {
    id: 'lifestyle_sleep_quality',
    number: 21,
    category: 'lifestyle',
    subcategory: 'sleep',
    question: 'Как вы оцениваете качество вашего сна?',
    type: 'radio',
    options: [
      { value: 2, label: 'Очень плохое (часто просыпаюсь, не высыпаюсь)' },
      { value: 1, label: 'Плохое (проблемы с засыпанием или пробуждения)' },
      { value: 0, label: 'Удовлетворительное' },
      { value: -1, label: 'Хорошее (обычно высыпаюсь)' },
      { value: -2, label: 'Отличное (крепкий сон, полон энергии)' }
    ]
  },
  {
    id: 'lifestyle_stress_level',
    number: 22,
    category: 'lifestyle',
    subcategory: 'stress',
    question: 'Как вы оцениваете уровень стресса в вашей жизни?',
    type: 'radio',
    options: [
      { value: 3, label: 'Очень высокий, постоянный стресс' },
      { value: 2, label: 'Высокий (часто чувствую напряжение)' },
      { value: 1, label: 'Умеренный' },
      { value: 0, label: 'Низкий (редко испытываю стресс)' }
    ]
  },
  {
    id: 'lifestyle_smoking',
    number: 23,
    category: 'lifestyle',
    subcategory: 'habits',
    question: 'Вы курите?',
    type: 'radio',
    options: [
      { value: 3, label: 'Да, курю сейчас' },
      { value: 1, label: 'Бросила менее года назад' },
      { value: 0, label: 'Бросила более года назад' },
      { value: 0, label: 'Никогда не курила' }
    ]
  },
  {
    id: 'lifestyle_sitting_time',
    number: 24,
    category: 'lifestyle',
    subcategory: 'exercise',
    question: 'Сколько часов в день вы проводите сидя?',
    description: 'Работа за компьютером, просмотр ТВ, поездки',
    type: 'radio',
    options: [
      { value: 3, label: 'Более 10 часов' },
      { value: 2, label: '8-10 часов' },
      { value: 1, label: '6-8 часов' },
      { value: 0, label: '4-6 часов' },
      { value: -1, label: 'Менее 4 часов' }
    ]
  },
  {
    id: 'lifestyle_stress_management',
    number: 25,
    category: 'lifestyle',
    subcategory: 'stress',
    question: 'Практикуете ли вы техники управления стрессом?',
    description: 'Медитация, йога, дыхательные практики, ведение дневника',
    type: 'radio',
    options: [
      { value: -2, label: 'Да, регулярно (почти каждый день)' },
      { value: -1, label: 'Да, несколько раз в неделю' },
      { value: 0, label: 'Иногда (несколько раз в месяц)' },
      { value: 0, label: 'Нет, не практикую' }
    ]
  }
]

export const ALL_QUESTIONS = [
  ...DEMOGRAPHICS_QUESTIONS,
  ...DIET_QUESTIONS,
  ...LIFESTYLE_QUESTIONS
]

