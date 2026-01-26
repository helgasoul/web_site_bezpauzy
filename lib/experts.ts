/**
 * Система управления экспертами (специалистами)
 * Автоматически подставляет фото и имя эксперта в зависимости от категории контента
 */

export type ExpertCategory = 'gynecologist' | 'mammologist' | 'nutritionist'

export interface Expert {
  id: string
  name: string
  role: string
  avatar: string
  category: ExpertCategory
  bio?: string
}

/**
 * База данных экспертов
 * Добавьте сюда всех экспертов с их фото и данными
 */
export const experts: Expert[] = [
  {
    id: 'shamugia-natia',
    name: 'Шамугия Натия',
    role: 'Гинеколог-эндокринолог, кандидат медицинских наук',
    avatar: '/shamugia-natiya.jpg',
    category: 'gynecologist',
    bio: 'Кандидат медицинских наук с опытом более 13 лет. Защитила диссертацию под руководством академика РАН, профессора Л.В. Адамян. Практикует в ведущих клиниках Москвы: Ильинская больница, Клиника Чайка. Международный диплом по эндоскопической хирургии (Université d\'Auvergne, Франция). Автор более 10 научных публикаций. Эксперт в области менопаузальной гормональной терапии и anti-aging терапии.',
  },
  {
    id: 'puchkova-olga',
    name: 'Пучкова Ольга',
    role: 'Маммолог-онколог, врач-рентгенолог, сертифицированный специалист EUSOBI',
    avatar: '/puchkova-olga.png',
    category: 'mammologist',
    bio: 'Ведущий маммолог-онколог с опытом более 20 лет. Единственный в России врач, сертифицированный Европейской ассоциацией радиологов EUSOBI (2016, Вена). Руководитель Маммологического центра К+31. Соавтор книг профессора László Tabár, переводчик и редактор серии 3D книг по маммологии. Стажировки в Швеции, Израиле, обучение у ведущих мировых экспертов.',
  },
  {
    id: 'klimkova-marina',
    name: 'Климкова Марина',
    role: 'Врач превентивной, интегративной и anti-age медицины, Нутрициолог, диетолог',
    avatar: '/marina-klimkova.jpg', // Файл находится в корне public
    category: 'nutritionist',
    bio: 'Врач с уникальным опытом более 20 лет, объединяющий клиническую медицину и превентивный подход. Международный диплом по нутрициологии (Leibniz Institute of Nutrition, Germany). Выпускница PreventAge Institute, специалист по медицине долголетия (Diploma in Longevity Medicine, 2024). Практикует в клиниках EMC, МЕДСИ, Патера, К+31. Единственный врач в России, сочетающий знания кардиологии, лучевой диагностики, нутрициологии и биохимии.',
  },
]

/**
 * Получить эксперта по категории
 * @param category - категория контента (gynecologist, mammologist, nutritionist)
 * @returns объект эксперта или null, если не найден
 */
export function getExpertByCategory(category: ExpertCategory): Expert | null {
  const expert = experts.find((exp) => exp.category === category)
  return expert || null
}

/**
 * Получить эксперта по ID
 * @param id - ID эксперта
 * @returns объект эксперта или null, если не найден
 */
export function getExpertById(id: string): Expert | null {
  const expert = experts.find((exp) => exp.id === id)
  return expert || null
}

/**
 * Получить эксперта по имени
 * @param name - имя эксперта
 * @returns объект эксперта или null, если не найден
 */
export function getExpertByName(name: string): Expert | null {
  const expert = experts.find((exp) => exp.name === name)
  return expert || null
}

/**
 * Получить всех экспертов определенной категории
 * @param category - категория контента
 * @returns массив экспертов
 */
export function getExpertsByCategory(category: ExpertCategory): Expert[] {
  return experts.filter((exp) => exp.category === category)
}

/**
 * Получить всех экспертов
 * @returns массив всех экспертов
 */
export function getAllExperts(): Expert[] {
  return experts
}

