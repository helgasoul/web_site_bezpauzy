import { jsPDF } from 'jspdf'
import { MRSResults } from '@/components/quiz/MRSQuiz'

export async function generateMRSReportPDF(results: MRSResults) {
  const severityLabels = {
    mild: { label: 'Лёгкая', color: [16, 185, 129] }, // green-500
    moderate: { label: 'Умеренная', color: [245, 158, 11] }, // yellow-500
    severe: { label: 'Выраженная', color: [239, 68, 68] }, // red-500
  }

  const date = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, fontStyle: string = 'normal', color: number[] = [26, 26, 46]) => {
    doc.setFontSize(fontSize)
    // Use 'helvetica' which supports basic Cyrillic in jsPDF
    doc.setFont('helvetica', fontStyle)
    doc.setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return lines.length * (fontSize * 0.4) // Approximate line height
  }

  // Helper function to load and add logo
  const addLogo = async () => {
    try {
      // Convert logo to base64
      const logoResponse = await fetch('/logo.png')
      if (!logoResponse.ok) throw new Error('Logo not found')
      
      const logoBlob = await logoResponse.blob()
      const logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(logoBlob)
      })

      // Add logo at the top center
      const logoSize = 25
      doc.addImage(logoBase64, 'PNG', pageWidth / 2 - logoSize / 2, yPosition, logoSize, logoSize)
      yPosition += logoSize + 10
    } catch (error) {
      console.error('Error loading logo:', error)
      // Add text logo if image fails
      doc.setFontSize(20)
      doc.setTextColor(139, 127, 214)
      doc.text('Без |Паузы', pageWidth / 2, yPosition + 10, { align: 'center' })
      yPosition += 20
    }
  }

  // Add logo
  await addLogo()

  // Header with gradient background
  doc.setFillColor(139, 127, 214) // primary-purple
  doc.roundedRect(margin, yPosition, contentWidth, 12, 3, 3, 'F')
  
  yPosition += 8
  addText('РЕЗУЛЬТАТЫ ОЦЕНКИ СИМПТОМОВ МЕНОПАУЗЫ', margin + 3, yPosition, contentWidth - 6, 16, 'bold', [255, 255, 255])
  
  yPosition += 10
  addText('Menopause Rating Scale (MRS)', margin, yPosition, contentWidth, 12, 'normal', [139, 127, 214])
  
  yPosition += 7
  addText(`Дата: ${date}`, margin, yPosition, contentWidth, 10, 'normal', [102, 102, 102])
  
  yPosition += 12

  // Total Score Section
  doc.setFillColor(245, 243, 255) // lavender-bg
  doc.roundedRect(margin, yPosition, contentWidth, 28, 3, 3, 'F')
  
  yPosition += 10
  const totalScoreText = `Общий балл: ${results.totalScore} / 44`
  addText(totalScoreText, margin + 5, yPosition, contentWidth - 10, 20, 'bold')
  
  yPosition += 10
  const severityInfo = severityLabels[results.severity]
  const severityText = `Степень тяжести: ${severityInfo.label}`
  addText(severityText, margin + 5, yPosition, contentWidth - 10, 14, 'bold', severityInfo.color)
  
  yPosition += 25

  // Category Scores
  checkNewPage(50)
  addText('Разбивка по категориям:', margin, yPosition, contentWidth, 14, 'bold')
  yPosition += 8

  const categories = [
    { name: 'Вазомоторные симптомы', score: results.vasomotorScore, desc: 'Приливы, ночная потливость' },
    { name: 'Психоэмоциональные', score: results.psychologicalScore, desc: 'Сон, настроение, усталость' },
    { name: 'Урогенитальные', score: results.urogenitalScore, desc: 'Мочевой пузырь, сухость' },
    { name: 'Соматические', score: results.somaticScore, desc: 'Сексуальные проблемы, боли' },
  ]

  const cardWidth = (contentWidth - 5) / 2
  const cardHeight = 30
  let cardX = margin
  let cardY = yPosition

  categories.forEach((category, index) => {
    if (index > 0 && index % 2 === 0) {
      cardY += cardHeight + 5
      cardX = margin
      checkNewPage(cardHeight + 10)
    } else if (index > 0) {
      cardX = margin + cardWidth + 5
    }

    // Category card background
    doc.setFillColor(249, 249, 249)
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'F')
    
    // Left border
    doc.setDrawColor(139, 127, 214)
    doc.setLineWidth(1)
    doc.line(cardX, cardY, cardX, cardY + cardHeight)

    // Category name
    addText(category.name, cardX + 4, cardY + 8, cardWidth - 8, 10, 'bold')
    
    // Score
    addText(category.score.toString(), cardX + 4, cardY + 16, cardWidth - 8, 18, 'bold', [139, 127, 214])
    
    // Description
    addText(category.desc, cardX + 4, cardY + 24, cardWidth - 8, 8, 'normal', [102, 102, 102])
  })

  yPosition = cardY + cardHeight + 15
  checkNewPage(30)

  // Recommendations
  addText('Персонализированные рекомендации:', margin, yPosition, contentWidth, 14, 'bold')
  yPosition += 8

  results.recommendations.forEach((rec) => {
    checkNewPage(12)
    const lineHeight = addText(`✓ ${rec}`, margin + 5, yPosition, contentWidth - 10, 10, 'normal')
    yPosition += lineHeight + 4
  })

  yPosition += 10
  checkNewPage(40)

  // Next Steps
  doc.setFillColor(255, 245, 245)
  doc.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F')
  
  yPosition += 8
  addText('Что делать дальше?', margin + 5, yPosition, contentWidth - 10, 12, 'bold')
  yPosition += 8

  const nextSteps = [
    'Запишитесь на приём к гинекологу, специализирующемуся на менопаузе',
    'Возьмите эти результаты с собой на приём',
    'Обсудите с врачом возможность ЗГТ или других методов лечения',
    'Задавайте вопросы о пользе, рисках и альтернативах',
  ]

  nextSteps.forEach((step, index) => {
    checkNewPage(10)
    const lineHeight = addText(`${index + 1}. ${step}`, margin + 5, yPosition, contentWidth - 10, 9, 'normal')
    yPosition += lineHeight + 3
  })

  yPosition += 15
  checkNewPage(25)

  // Footer
  doc.setDrawColor(221, 221, 221)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 8

  addText('Важно: Этот опросник не заменяет консультацию врача.', margin, yPosition, contentWidth, 9, 'normal', [102, 102, 102])
  yPosition += 6
  addText('Результаты носят информационный характер и не являются диагнозом.', margin, yPosition, contentWidth, 9, 'normal', [102, 102, 102])
  yPosition += 8
  addText('Без |Паузы - bezpauzy.ru', margin, yPosition, contentWidth, 9, 'bold', [139, 127, 214])

  // Save PDF
  const fileName = `MRS_Результаты_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
