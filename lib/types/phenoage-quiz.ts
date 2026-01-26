// Types for PhenoAge Quiz

export interface PhenoAgeParams {
  age: number // Хронологический возраст
  albumin: number // Альбумин (г/л)
  creatinine: number // Креатинин (мг/дл)
  glucose: number // Глюкоза (мг/дл)
  crp: number // C-реактивный белок (мг/л)
  lymph: number // Лимфоциты (%)
  mcv: number // Средний объем эритроцитов (фл)
  rdw: number // Ширина распределения эритроцитов (%)
  alkphos: number // Щелочная фосфатаза (Ед/л)
  wbc: number // Лейкоциты (×10^9/л)
}

export interface PhenoAgeResult {
  phenoAge: number
  difference: number // Разница между биологическим и хронологическим возрастом
  mortalityScore: number
  interpretation: string
  color: string
  icon: React.ReactNode
}

export interface BiomarkerAnalysis {
  name: string
  value: number
  status: 'optimal' | 'normal' | 'warning' | 'danger'
  impact: string
  recommendation: string
}

