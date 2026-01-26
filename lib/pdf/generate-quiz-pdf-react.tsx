import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { InflammationQuizPDF } from './InflammationQuizPDF'
import { MRSQuizPDF } from './MRSQuizPDF'
import { PhenoAgeQuizPDF } from './PhenoAgeQuizPDF'
import { FRAXQuizPDF } from './FRAXQuizPDF'
import { registerCyrillicFonts } from './fonts-loader'

// Экспортируем типы для совместимости
export interface InflammationQuizPDFData {
  total_inflammation_score: number
  inflammation_level: string
  diet_score: number
  lifestyle_score: number
  bmi_score: number
  waist_score: number
  bmi: number
  high_risk_categories: string[]
  demographics: {
    age_range: string
    height_cm: number
    weight_kg: number
    waist_circumference_cm?: number
  }
  recommendations: string[]
}

export interface MRSQuizPDFData {
  total_score: number
  severity: string
  vasomotor_score: number
  psychological_score: number
  urogenital_score: number
  somatic_score: number
  recommendations: string[]
}

export interface PhenoAgeQuizPDFData {
  phenoAge: number
  chronologicalAge: number
  difference: number
  interpretation: string
  biomarkerAnalyses: Array<{
    name: string
    value: number
    status: 'optimal' | 'normal' | 'warning' | 'danger'
    impact: string
    recommendation: string
  }>
  formData: {
    age: number
    albumin: number
    creatinine: number
    glucose: number
    crp: number
    lymph: number
    mcv: number
    rdw: number
    alkphos: number
    wbc: number
  }
}

export interface FRAXQuizPDFData {
  hip_fracture_risk_10y: number
  major_osteoporotic_fracture_risk_10y: number
  risk_level: 'low' | 'moderate' | 'high'
  recommendations: string[]
  answers: any
}

/**
 * Генерирует PDF для квиза на воспаление
 * Использует @react-pdf/renderer для отличной поддержки кириллицы
 */
export async function generateInflammationQuizPDF(
  data: InflammationQuizPDFData
): Promise<Buffer> {
  try {
    // Регистрируем шрифты перед рендерингом
    await registerCyrillicFonts()
    
    const pdfBuffer = await renderToBuffer(
      <InflammationQuizPDF data={data} />
    )
    
    return pdfBuffer
  } catch (error: any) {
    console.error('❌ Ошибка генерации PDF:', error)
    throw new Error(`Ошибка генерации PDF: ${error?.message || String(error)}`)
  }
}

/**
 * Генерирует PDF для MRS квиза
 * Использует @react-pdf/renderer для отличной поддержки кириллицы
 */
export async function generateMRSQuizPDF(data: MRSQuizPDFData): Promise<Buffer> {
  try {
    // Регистрируем шрифты перед рендерингом
    await registerCyrillicFonts()
    
    const pdfBuffer = await renderToBuffer(
      <MRSQuizPDF data={data} />
    )
    
    return pdfBuffer
  } catch (error: any) {
    console.error('❌ Ошибка генерации PDF:', error)
    throw new Error(`Ошибка генерации PDF: ${error?.message || String(error)}`)
  }
}

/**
 * Генерирует PDF для квиза PhenoAge
 * Использует @react-pdf/renderer для отличной поддержки кириллицы
 */
export async function generatePhenoAgePDF(data: PhenoAgeQuizPDFData): Promise<Buffer> {
  try {
    // Регистрируем шрифты перед рендерингом
    await registerCyrillicFonts()
    
    const pdfBuffer = await renderToBuffer(
      <PhenoAgeQuizPDF data={data} />
    )
    
    return pdfBuffer
  } catch (error: any) {
    console.error('❌ Ошибка генерации PDF:', error)
    throw new Error(`Ошибка генерации PDF: ${error?.message || String(error)}`)
  }
}

/**
 * Генерирует PDF для FRAX квиза
 * Использует @react-pdf/renderer для отличной поддержки кириллицы
 */
export async function generateFRAXQuizPDF(data: FRAXQuizPDFData): Promise<Buffer> {
  try {
    // Регистрируем шрифты перед рендерингом
    await registerCyrillicFonts()
    
    const pdfBuffer = await renderToBuffer(
      <FRAXQuizPDF data={data} />
    )
    
    return pdfBuffer
  } catch (error: any) {
    console.error('❌ Ошибка генерации PDF:', error)
    throw new Error(`Ошибка генерации PDF: ${error?.message || String(error)}`)
  }
}
