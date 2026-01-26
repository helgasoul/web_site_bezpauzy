export interface FRAXQuestion {
  id: string
  number: number
  question: string
  description?: string
  type: 'yes_no' | 'number' | 'select'
  options?: Array<{ value: string | number; label: string }>
  required: boolean
}

export interface FRAXAnswers {
  age?: number
  sex?: 'female' | 'male'
  previous_fracture?: boolean
  parent_hip_fracture?: boolean
  current_smoking?: boolean
  glucocorticoids?: boolean
  rheumatoid_arthritis?: boolean
  secondary_osteoporosis?: boolean
  alcohol?: boolean
  bmd?: number
  bmd_t_score?: number
}

export interface FRAXResults {
  hip_fracture_risk_10y: number // 10-year probability of hip fracture (%)
  major_osteoporotic_fracture_risk_10y: number // 10-year probability of major osteoporotic fracture (%)
  risk_level: 'low' | 'moderate' | 'high'
  recommendations: string[]
}

