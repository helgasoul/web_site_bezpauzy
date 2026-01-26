import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { AntiInflammatoryGuidePDF } from './AntiInflammatoryGuidePDF'
import { registerCyrillicFonts } from './fonts-loader'

export async function generateAntiInflammatoryGuidePDF(): Promise<Buffer> {
  try {
    // Регистрируем шрифты перед рендерингом
    await registerCyrillicFonts()

    const pdfBuffer = await renderToBuffer(<AntiInflammatoryGuidePDF />)
    return pdfBuffer
  } catch (error) {
    console.error('Error generating anti-inflammatory guide PDF:', error)
    throw new Error('Failed to generate anti-inflammatory guide PDF')
  }
}

