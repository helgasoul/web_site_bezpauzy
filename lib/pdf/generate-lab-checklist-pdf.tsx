import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { LabChecklistPDF } from './LabChecklistPDF'
import { registerCyrillicFonts } from './fonts-loader'

export async function generateLabChecklistPDF(): Promise<Buffer> {
  try {
    // Регистрируем шрифты перед рендерингом
    await registerCyrillicFonts()

    const pdfBuffer = await renderToBuffer(<LabChecklistPDF />)
    return pdfBuffer
  } catch (error) {
    console.error('Error generating lab checklist PDF:', error)
    throw new Error('Failed to generate lab checklist PDF')
  }
}
