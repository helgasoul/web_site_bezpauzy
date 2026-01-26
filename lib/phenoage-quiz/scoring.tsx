import React from 'react'
import type { PhenoAgeParams, PhenoAgeResult, BiomarkerAnalysis } from '@/lib/types/phenoage-quiz'
import type { ReferenceRange } from './referenceRanges'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

/**
 * Рассчитывает PhenoAge (биологический возраст) на основе формулы Levine et al. 2018
 * Источник: Levine ME et al. "An epigenetic biomarker of aging for lifespan and healthspan."
 * Aging (Albany NY). 2018;10(4):573-591.
 * 
 * Формула основана на точных коэффициентах из Table S6 оригинального исследования
 */
export function calculatePhenoAge(params: PhenoAgeParams): PhenoAgeResult {
  const {
    albumin, creatinine, glucose, crp, lymph,
    mcv, rdw, alkphos, wbc, age
  } = params

  // Проверка на валидность всех параметров
  if (!albumin || !creatinine || !glucose || crp === undefined || !lymph || 
      !mcv || !rdw || !alkphos || !wbc || !age) {
    throw new Error('Не все параметры заполнены')
  }

  // ШАГ 1: Расчёт линейной комбинации (xb)
  // Формула из Levine et al., 2018 - Table S6
  const crpValue = Math.max(crp, 0.01) // Избегаем log(0)
  
  const xb = -19.907 
    - 0.0336 * albumin 
    + 0.0095 * creatinine
    + 0.1953 * glucose
    + 0.0954 * Math.log(crpValue)
    - 0.0120 * lymph
    + 0.0268 * mcv
    + 0.3306 * rdw
    + 0.00188 * alkphos
    + 0.0554 * wbc
    + 0.0804 * age

  // ШАГ 2: Расчёт mortality score
  const gamma = 0.0076927
  const expXb = Math.exp(xb)
  
  // mortality_score = 1 - exp(-exp(xb) × (exp(120×γ) - 1) / γ)
  const expTerm = Math.exp(120 * gamma)
  const mortalityScore = 1 - Math.exp(-expXb * (expTerm - 1) / gamma)

  // ШАГ 3: Расчёт PhenoAge
  let phenoAge: number

  try {
    // PhenoAge = 141.50225 + ln(-0.00553 × ln(1 - mortality_score)) / 0.090165
    const innerLog = Math.log(1 - mortalityScore)
    
    // Проверка на допустимость
    if (mortalityScore >= 0.999 || innerLog >= 0) {
      // Mortality score слишком высокий (≥99.9%)
      // Это означает очень плохие биомаркеры
      phenoAge = 150 // Максимальное разумное значение
    } else {
      const outerLog = Math.log(-0.00553 * innerLog)
      
      if (isNaN(outerLog) || !isFinite(outerLog)) {
        phenoAge = 150
      } else {
        // ВАЖНО: Используем 0.090165 (оригинальная формула из Levine 2018)
        // Есть исправление в Liu 2019 где указано 0.09165, но мы используем оригинал
        phenoAge = 141.50225 + outerLog / 0.090165
      }
    }
    
    // Валидация результата
    if (isNaN(phenoAge) || !isFinite(phenoAge)) {
      throw new Error('Invalid phenoAge calculation')
    }
    
    // Биологический возраст должен быть в разумных пределах
    // Минимум 20 лет (даже для идеальных биомаркеров)
    // Максимум 150 лет (для очень плохих биомаркеров)
    phenoAge = Math.max(20, Math.min(150, phenoAge))
    
  } catch (error) {
    console.error('Error calculating PhenoAge:', error)
    // В крайнем случае возвращаем хронологический возраст
    phenoAge = age
  }

  const difference = phenoAge - age

  // Интерпретация результата
  let interpretation = ''
  let color = ''
  let icon: React.ReactNode

  if (difference < -5) {
    interpretation = 'Отличный результат! Ваш биологический возраст существенно младше хронологического. Продолжайте придерживаться здорового образа жизни.'
    color = 'text-green-600 bg-green-50 border-green-200'
    icon = <TrendingDown className="w-6 h-6 text-green-600" />
  } else if (difference >= -5 && difference <= 5) {
    interpretation = 'Хороший результат. Ваш биологический возраст соответствует хронологическому. Это нормальный показатель здорового старения.'
    color = 'text-blue-600 bg-blue-50 border-blue-200'
    icon = <Minus className="w-6 h-6 text-blue-600" />
  } else if (difference > 5 && difference <= 10) {
    interpretation = 'Умеренное ускоренное старение. Рекомендуется обратить внимание на образ жизни, питание и физическую активность. Проконсультируйтесь с врачом.'
    color = 'text-orange-600 bg-orange-50 border-orange-200'
    icon = <TrendingUp className="w-6 h-6 text-orange-600" />
  } else {
    interpretation = 'Выраженное ускоренное старение. Настоятельно рекомендуется консультация врача для детального обследования и коррекции факторов риска.'
    color = 'text-red-600 bg-red-50 border-red-200'
    icon = <TrendingUp className="w-6 h-6 text-red-600" />
  }

  return {
    phenoAge: Math.round(phenoAge * 10) / 10,
    difference: Math.round(difference * 10) / 10,
    mortalityScore: Math.round(mortalityScore * 1000) / 1000,
    interpretation,
    color,
    icon
  }
}

/**
 * Анализирует биомаркеры и определяет их статус
 * Основано на научных данных о взаимосвязи биомаркеров со старением
 */
export function analyzeBiomarkers(
  params: PhenoAgeParams,
  ranges: Record<string, ReferenceRange>
): BiomarkerAnalysis[] {
  const analyses: BiomarkerAnalysis[] = []

  // Альбумин
  analyses.push({
    name: 'Альбумин',
    value: params.albumin,
    status: params.albumin >= 4.0 ? 'optimal' : params.albumin >= 3.5 ? 'normal' : 'warning',
    impact: 'Низкий альбумин связан с недостаточным питанием, воспалением и ускоренным старением',
    recommendation: params.albumin < 4.0 
      ? 'Увеличьте потребление белка (мясо, рыба, яйца, бобовые)' 
      : 'Отличный показатель, продолжайте в том же духе'
  })

  // Креатинин
  analyses.push({
    name: 'Креатинин',
    value: params.creatinine,
    status: params.creatinine <= 1.0 ? 'optimal' : params.creatinine <= 1.2 ? 'normal' : 'warning',
    impact: 'Маркер функции почек. Повышенный уровень указывает на снижение фильтрации',
    recommendation: params.creatinine > 1.0
      ? 'Обратитесь к врачу для оценки функции почек. Пейте достаточно воды'
      : 'Почки работают хорошо'
  })

  // Глюкоза
  analyses.push({
    name: 'Глюкоза',
    value: params.glucose,
    status: params.glucose <= 100 ? 'optimal' : params.glucose <= 125 ? 'warning' : 'danger',
    impact: 'Высокая глюкоза ускоряет старение через гликирование белков',
    recommendation: params.glucose > 100
      ? 'Ограничьте быстрые углеводы, увеличьте физактивность, проверьте HbA1c'
      : 'Отличный контроль уровня сахара'
  })

  // C-реактивный белок
  analyses.push({
    name: 'C-реактивный белок',
    value: params.crp,
    status: params.crp <= 1.0 ? 'optimal' : params.crp <= 3.0 ? 'normal' : params.crp <= 10 ? 'warning' : 'danger',
    impact: 'Маркер системного воспаления - ключевой фактор старения',
    recommendation: params.crp > 3.0
      ? 'Необходимо снизить воспаление: противовоспалительная диета, омега-3, проверка на инфекции'
      : params.crp > 1.0
      ? 'Добавьте антиоксиданты, омега-3, физактивность'
      : 'Отличный низкий уровень воспаления'
  })

  // Лимфоциты
  analyses.push({
    name: 'Лимфоциты',
    value: params.lymph,
    status: params.lymph >= 25 && params.lymph <= 40 ? 'optimal' 
          : params.lymph >= 20 && params.lymph < 25 ? 'normal'
          : params.lymph > 40 && params.lymph <= 50 ? 'warning'
          : 'danger',
    impact: 'Отражают состояние иммунной системы. Повышение может указывать на вирусную инфекцию, стресс или лимфопролиферативные состояния',
    recommendation: params.lymph > 40
      ? 'Лимфоциты повышены. Рекомендуется пересдать анализ через 3-6 месяцев. Если сохраняется — консультация гематолога'
      : params.lymph < 25
      ? 'Поддержите иммунитет: витамин D, цинк, полноценный сон'
      : 'Иммунная система в порядке'
  })

  // MCV
  analyses.push({
    name: 'Средний объем эритроцитов',
    value: params.mcv,
    status: params.mcv <= 95 ? 'optimal' : params.mcv <= 100 ? 'normal' : 'warning',
    impact: 'Высокий MCV связан с дефицитом B12/фолатов или проблемами печени',
    recommendation: params.mcv > 95
      ? 'Проверьте B12, фолаты, функцию печени'
      : 'Нормальный размер эритроцитов'
  })

  // RDW
  analyses.push({
    name: 'Ширина распределения эритроцитов',
    value: params.rdw,
    status: params.rdw <= 13.0 ? 'optimal' : params.rdw <= 14.5 ? 'normal' : 'warning',
    impact: 'Повышенный RDW - сильный предиктор смертности и сердечно-сосудистых событий',
    recommendation: params.rdw > 14.0
      ? 'Требуется консультация врача. Проверьте железо, B12, фолаты'
      : 'Отличная однородность эритроцитов'
  })

  // Щелочная фосфатаза
  analyses.push({
    name: 'Щелочная фосфатаза',
    value: params.alkphos,
    status: params.alkphos <= 70 ? 'optimal' : params.alkphos <= 120 ? 'normal' : 'warning',
    impact: 'Высокие уровни связаны с сердечно-сосудистыми заболеваниями и смертностью',
    recommendation: params.alkphos > 100
      ? 'Проверьте печень и кости. Снизьте потребление фосфатов'
      : 'Оптимальный уровень'
  })

  // Лейкоциты
  analyses.push({
    name: 'Лейкоциты',
    value: params.wbc,
    status: params.wbc <= 7.0 ? 'optimal' : params.wbc <= 11.0 ? 'normal' : 'warning',
    impact: 'Умеренное повышение связано с хроническим воспалением',
    recommendation: params.wbc > 8.0
      ? 'Хроническое воспаление. Нужна противовоспалительная терапия'
      : 'Отличный уровень'
  })

  return analyses
}

