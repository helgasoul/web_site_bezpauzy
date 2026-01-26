import type { FRAXAnswers, FRAXResults } from '@/lib/types/frax-quiz'

/**
 * Упрощённая оценка риска переломов на основе FRAX
 * 
 * Примечание: Это упрощённая версия для образовательных целей.
 * Официальный FRAX калькулятор доступен на https://www.sheffield.ac.uk/FRAX/
 * 
 * Для точной оценки рекомендуется использовать официальный инструмент FRAX.
 */
export function calculateFRAXScore(answers: FRAXAnswers): FRAXResults {
  let riskScore = 0
  const recommendations: string[] = []

  // Базовый риск по возрасту (для женщин)
  if (answers.age) {
    if (answers.age >= 70) riskScore += 30
    else if (answers.age >= 60) riskScore += 20
    else if (answers.age >= 50) riskScore += 10
  }

  // Факторы риска
  if (answers.previous_fracture) {
    riskScore += 25
    recommendations.push('Предыдущий перелом — важный фактор риска. Обсудите с врачом необходимость лечения остеопороза.')
  }

  if (answers.parent_hip_fracture) {
    riskScore += 15
    recommendations.push('Семейная история переломов бедра увеличивает ваш риск. Регулярно проверяйте плотность костной ткани.')
  }

  if (answers.current_smoking) {
    riskScore += 10
    recommendations.push('Курение увеличивает риск остеопороза. Рассмотрите возможность отказа от курения.')
  }

  if (answers.glucocorticoids) {
    riskScore += 15
    recommendations.push('Длительный приём глюкокортикоидов требует особого внимания к здоровью костей. Обсудите с врачом профилактику.')
  }

  if (answers.rheumatoid_arthritis) {
    riskScore += 10
    recommendations.push('Ревматоидный артрит связан с повышенным риском остеопороза. Регулярно контролируйте здоровье костей.')
  }

  if (answers.secondary_osteoporosis) {
    riskScore += 20
    recommendations.push('Вторичный остеопороз требует комплексного подхода. Важно лечить основное заболевание и укреплять кости.')
  }

  if (answers.alcohol) {
    riskScore += 5
    recommendations.push('Избыточное потребление алкоголя негативно влияет на кости. Рекомендуется ограничить потребление.')
  }

  // BMD (если доступно)
  if (answers.bmd_t_score !== undefined) {
    if (answers.bmd_t_score <= -2.5) {
      riskScore += 30
      recommendations.push('Диагностирован остеопороз (T-score ≤ -2.5). Необходимо лечение под наблюдением врача.')
    } else if (answers.bmd_t_score <= -1.0) {
      riskScore += 15
      recommendations.push('Остеопения (T-score от -1.0 до -2.5). Важна профилактика и регулярный мониторинг.')
    }
  }

  // Расчёт вероятности переломов (упрощённый)
  // В реальном FRAX используются сложные алгоритмы на основе больших когорт
  const hip_fracture_risk_10y = Math.min(riskScore * 0.3, 30) // Максимум 30%
  const major_osteoporotic_fracture_risk_10y = Math.min(riskScore * 0.5, 50) // Максимум 50%

  // Определение уровня риска
  let risk_level: 'low' | 'moderate' | 'high'
  if (major_osteoporotic_fracture_risk_10y < 10) {
    risk_level = 'low'
    if (!recommendations.length) {
      recommendations.push('Ваш риск переломов низкий. Продолжайте вести здоровый образ жизни: достаточное потребление кальция и витамина D, регулярные физические упражнения.')
    }
  } else if (major_osteoporotic_fracture_risk_10y < 20) {
    risk_level = 'moderate'
    recommendations.push('У вас умеренный риск переломов. Рекомендуется денситометрия (DEXA) и консультация с врачом о профилактике.')
  } else {
    risk_level = 'high'
    recommendations.push('У вас высокий риск переломов. Необходима консультация с врачом и, возможно, лечение остеопороза.')
  }

  // Общие рекомендации
  recommendations.push('Для точной оценки риска используйте официальный FRAX калькулятор: https://www.sheffield.ac.uk/FRAX/')
  recommendations.push('Регулярно проверяйте уровень витамина D и кальция в крови.')
  recommendations.push('Выполняйте упражнения с весовой нагрузкой для укрепления костей.')

  return {
    hip_fracture_risk_10y: Math.round(hip_fracture_risk_10y * 10) / 10,
    major_osteoporotic_fracture_risk_10y: Math.round(major_osteoporotic_fracture_risk_10y * 10) / 10,
    risk_level,
    recommendations,
  }
}

