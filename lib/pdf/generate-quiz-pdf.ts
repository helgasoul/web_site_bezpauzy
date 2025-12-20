import { jsPDF } from 'jspdf'
import { safeText, initCyrillicFonts } from './cyrillic-fonts'

// Для поддержки кириллицы в jsPDF используем кастомные шрифты DejaVu Sans
// Шрифты загружаются и регистрируются через initCyrillicFonts

interface InflammationQuizPDFData {
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

interface MRSQuizPDFData {
  total_score: number
  severity: string
  vasomotor_score: number
  psychological_score: number
  urogenital_score: number
  somatic_score: number
  recommendations: string[]
}

const levelLabels: Record<string, string> = {
  very_low: 'Очень низкий',
  low: 'Низкий',
  moderate: 'Умеренный',
  elevated: 'Повышенный',
  high: 'Высокий',
  mild: 'Лёгкая',
  severe: 'Выраженная',
  no_symptoms: 'Отсутствуют',
}

const severityLabels: Record<string, string> = {
  mild: 'Лёгкая',
  moderate: 'Умеренная',
  severe: 'Выраженная',
  no_symptoms: 'Отсутствуют',
}

export async function generateInflammationQuizPDF(data: InflammationQuizPDFData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Инициализируем кириллические шрифты (работает на клиенте и сервере)
  await initCyrillicFonts(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Цвета из дизайн-системы
  const primaryPurple = [139, 127, 214] // #8B7FD6
  const oceanWave = [125, 211, 224] // #7DD3E0
  const deepNavy = [61, 68, 97] // #3D4461

  // Заголовок
  doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Логотип (если доступен)
  try {
    // Можно добавить логотип через doc.addImage, если файл доступен
    // const logoPath = join(process.cwd(), 'public', 'logo.png')
    // if (existsSync(logoPath)) {
    //   doc.addImage(logoPath, 'PNG', margin, 5, 15, 15)
    // }
  } catch (e) {
    // Логотип не обязателен
  }
  
  doc.setTextColor(255, 255, 255)
  safeText(doc, 'Индекс воспаления', pageWidth / 2, 25, { 
    align: 'center',
    fontSize: 24,
    fontStyle: 'bold'
  })
  
  const date = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  safeText(doc, `Дата: ${date}`, pageWidth / 2, 35, { 
    align: 'center',
    fontSize: 12
  })

  yPos = 60
  doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2])

  // Основной результат
  const levelLabel = levelLabels[data.inflammation_level] || data.inflammation_level
  safeText(doc, 'Ваш результат', margin, yPos, {
    fontSize: 18,
    fontStyle: 'bold'
  })
  yPos += 10

  safeText(doc, `Уровень воспаления: ${levelLabel}`, margin, yPos, { fontSize: 14 })
  yPos += 7

  safeText(doc, `Общий индекс: ${data.total_inflammation_score > 0 ? '+' : ''}${data.total_inflammation_score}`, margin, yPos, { fontSize: 14 })
  yPos += 10

  // Детализация баллов
  safeText(doc, 'Детализация баллов', margin, yPos, {
    fontSize: 16,
    fontStyle: 'bold'
  })
  yPos += 8
  safeText(doc, `Питание: ${data.diet_score > 0 ? '+' : ''}${data.diet_score} баллов`, margin, yPos, { fontSize: 12 })
  yPos += 6
  safeText(doc, `Образ жизни: ${data.lifestyle_score > 0 ? '+' : ''}${data.lifestyle_score} баллов`, margin, yPos, { fontSize: 12 })
  yPos += 6
  safeText(doc, `ИМТ: ${data.bmi.toFixed(1)} (${data.bmi_score} баллов)`, margin, yPos, { fontSize: 12 })
  yPos += 6
  if (data.waist_score > 0) {
    safeText(doc, `Окружность талии: ${data.waist_score} баллов`, margin, yPos, { fontSize: 12 })
    yPos += 6
  }
  yPos += 5

  // Демографические данные
  if (data.demographics) {
    safeText(doc, 'Ваши данные', margin, yPos, {
      fontSize: 14,
      fontStyle: 'bold'
    })
    yPos += 8
    safeText(doc, `Возраст: ${data.demographics.age_range}`, margin, yPos, { fontSize: 12 })
    yPos += 6
    safeText(doc, `Рост: ${data.demographics.height_cm} см`, margin, yPos, { fontSize: 12 })
    yPos += 6
    safeText(doc, `Вес: ${data.demographics.weight_kg} кг`, margin, yPos, { fontSize: 12 })
    yPos += 6
    if (data.demographics.waist_circumference_cm) {
      safeText(doc, `Окружность талии: ${data.demographics.waist_circumference_cm} см`, margin, yPos, { fontSize: 12 })
      yPos += 6
    }
    yPos += 5
  }

  // Области для улучшения
  if (data.high_risk_categories.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = margin
    }

    safeText(doc, 'Области для улучшения', margin, yPos, {
      fontSize: 14,
      fontStyle: 'bold'
    })
    yPos += 8
    const categoryLabels: Record<string, string> = {
      processed_meat: 'Обработанное мясо',
      refined_carbs: 'Рафинированные углеводы',
      omega3_deficiency: 'Недостаток омега-3',
      low_fiber: 'Низкое потребление клетчатки',
      excessive_alcohol: 'Избыток алкоголя',
      sedentary: 'Малоподвижный образ жизни',
      poor_sleep: 'Проблемы со сном',
      high_stress: 'Высокий уровень стресса',
      smoking: 'Курение',
      obesity: 'Ожирение',
      abdominal_obesity: 'Абдоминальное ожирение',
    }

    data.high_risk_categories.forEach((category) => {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
      }
      safeText(doc, `• ${categoryLabels[category] || category}`, margin + 5, yPos, { fontSize: 11 })
      yPos += 6
    })
    yPos += 5
  }

  // Рекомендации
  if (data.recommendations && data.recommendations.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = margin
    }

    safeText(doc, 'Рекомендации', margin, yPos, {
      fontSize: 14,
      fontStyle: 'bold'
    })
    yPos += 8
    data.recommendations.forEach((rec, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
      }
      safeText(doc, `${index + 1}. ${rec}`, margin + 5, yPos, {
        fontSize: 11,
        maxWidth: pageWidth - 2 * margin - 10
      })
      yPos += 6
    })
  }

  // Футер с предупреждением
  const footerY = pageHeight - 15
  doc.setTextColor(100, 100, 100)
  const footerText = 'Этот опросник не заменяет консультацию врача. Результаты носят информационный характер.'
  safeText(doc, footerText, pageWidth / 2, footerY, {
    align: 'center',
    fontSize: 9,
    maxWidth: pageWidth - 2 * margin
  })

  // Логотип (если есть)
  // Можно добавить логотип через doc.addImage, если нужно

  return doc
}

export async function generateMRSQuizPDF(data: MRSQuizPDFData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Инициализируем кириллические шрифты (работает на клиенте и сервере)
  await initCyrillicFonts(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Цвета из дизайн-системы
  const primaryPurple = [139, 127, 214] // #8B7FD6
  const oceanWave = [125, 211, 224] // #7DD3E0
  const deepNavy = [61, 68, 97] // #3D4461

  // Заголовок
  doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Логотип (если доступен)
  try {
    // Можно добавить логотип через doc.addImage, если файл доступен
    // const logoPath = join(process.cwd(), 'public', 'logo.png')
    // if (existsSync(logoPath)) {
    //   doc.addImage(logoPath, 'PNG', margin, 5, 15, 15)
    // }
  } catch (e) {
    // Логотип не обязателен
  }
  
  doc.setTextColor(255, 255, 255)
  safeText(doc, 'Шкала оценки менопаузальных симптомов', pageWidth / 2, 20, {
    align: 'center',
    fontSize: 24,
    fontStyle: 'bold'
  })
  // Английский текст можно оставить с helvetica
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('Menopause Rating Scale (MRS)', pageWidth / 2, 30, { align: 'center' })
  
  const date = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  safeText(doc, `Дата: ${date}`, pageWidth / 2, 40, {
    align: 'center',
    fontSize: 12
  })

  yPos = 60
  doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2])

  // Основной результат
  safeText(doc, 'Ваш результат', margin, yPos, {
    fontSize: 18,
    fontStyle: 'bold'
  })
  yPos += 10

  const severityLabel = severityLabels[data.severity] || data.severity
  safeText(doc, `Общий балл: ${data.total_score} из 44`, margin, yPos, { fontSize: 14 })
  yPos += 7
  safeText(doc, `Степень тяжести: ${severityLabel}`, margin, yPos, { fontSize: 14 })
  yPos += 10

  // Детализация по категориям
  safeText(doc, 'Детализация по категориям', margin, yPos, {
    fontSize: 16,
    fontStyle: 'bold'
  })
  yPos += 8

  safeText(doc, `Соматические симптомы: ${data.somatic_score} баллов`, margin, yPos, { fontSize: 12 })
  safeText(doc, '(приливы, сердцебиение, сон, боли)', margin + 5, yPos + 5, { fontSize: 12 })
  yPos += 12
  safeText(doc, `Психологические симптомы: ${data.psychological_score} баллов`, margin, yPos, { fontSize: 12 })
  safeText(doc, '(настроение, раздражительность, тревога, усталость)', margin + 5, yPos + 5, { fontSize: 12 })
  yPos += 12
  safeText(doc, `Урогенитальные симптомы: ${data.urogenital_score} баллов`, margin, yPos, { fontSize: 12 })
  safeText(doc, '(половая жизнь, мочевой пузырь, сухость)', margin + 5, yPos + 5, { fontSize: 12 })
  yPos += 12
  safeText(doc, `Вазомоторные симптомы: ${data.vasomotor_score} баллов`, margin, yPos, { fontSize: 12 })
  yPos += 15

  // Рекомендации
  if (data.recommendations && data.recommendations.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = margin
    }

    safeText(doc, 'Рекомендации', margin, yPos, {
      fontSize: 14,
      fontStyle: 'bold'
    })
    yPos += 8

    data.recommendations.forEach((rec, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
      }
      safeText(doc, `${index + 1}. ${rec}`, margin + 5, yPos, {
        fontSize: 11,
        maxWidth: pageWidth - 2 * margin - 10
      })
      yPos += 6
    })
  }

  // Футер с предупреждением
  const footerY = pageHeight - 15
  doc.setTextColor(100, 100, 100)
  const footerText1 = 'Этот опросник не заменяет консультацию врача. Результаты носят информационный характер.'
  safeText(doc, footerText1, pageWidth / 2, footerY, {
    align: 'center',
    fontSize: 9,
    maxWidth: pageWidth - 2 * margin
  })
  const footerText2 = 'Принесите эти результаты на приём к гинекологу для обсуждения возможности ЗГТ или других методов лечения.'
  safeText(doc, footerText2, pageWidth / 2, footerY + 4, {
    align: 'center',
    fontSize: 9,
    maxWidth: pageWidth - 2 * margin
  })

  return doc
}

