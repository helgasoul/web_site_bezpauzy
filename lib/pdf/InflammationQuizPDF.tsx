import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

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

interface InflammationQuizPDFProps {
  data: InflammationQuizPDFData
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

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'NotoSans',
    fontSize: 12,
  },
  header: {
    backgroundColor: '#8B7FD6',
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerTitle: {
    fontFamily: 'NotoSans',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerDate: {
    fontFamily: 'NotoSans',
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    color: '#3D4461',
  },
  sectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#3D4461',
  },
  subsectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#3D4461',
  },
  text: {
    fontFamily: 'NotoSans',
    fontSize: 12,
    marginBottom: 6,
    color: '#3D4461',
  },
  textSmall: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    marginBottom: 5,
    color: '#3D4461',
  },
  bullet: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    marginBottom: 5,
    marginLeft: 10,
    color: '#3D4461',
  },
  footer: {
    fontFamily: 'NotoSans',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 9,
    color: '#646464',
    textAlign: 'center',
  },
})

export const InflammationQuizPDF: React.FC<InflammationQuizPDFProps> = ({ data }) => {
  const date = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const levelLabel = levelLabels[data.inflammation_level] || data.inflammation_level

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Индекс воспаления</Text>
          <Text style={styles.headerDate}>Дата: {date}</Text>
        </View>

        {/* Контент */}
        <View style={styles.content}>
          {/* Основной результат */}
          <Text style={styles.sectionTitle}>Ваш результат</Text>
          <Text style={styles.text}>
            Уровень воспаления: {levelLabel}
          </Text>
          <Text style={styles.text}>
            Общий индекс: {data.total_inflammation_score > 0 ? '+' : ''}{data.total_inflammation_score}
          </Text>

          {/* Детализация баллов */}
          <Text style={styles.subsectionTitle}>Детализация баллов</Text>
          <Text style={styles.textSmall}>
            Питание: {data.diet_score > 0 ? '+' : ''}{data.diet_score} баллов
          </Text>
          <Text style={styles.textSmall}>
            Образ жизни: {data.lifestyle_score > 0 ? '+' : ''}{data.lifestyle_score} баллов
          </Text>
          <Text style={styles.textSmall}>
            ИМТ: {data.bmi.toFixed(1)} ({data.bmi_score} баллов)
          </Text>
          {data.waist_score > 0 && (
            <Text style={styles.textSmall}>
              Окружность талии: {data.waist_score} баллов
            </Text>
          )}

          {/* Демографические данные */}
          {data.demographics && (
            <>
              <Text style={styles.subsectionTitle}>Ваши данные</Text>
              <Text style={styles.textSmall}>Возраст: {data.demographics.age_range}</Text>
              <Text style={styles.textSmall}>Рост: {data.demographics.height_cm} см</Text>
              <Text style={styles.textSmall}>Вес: {data.demographics.weight_kg} кг</Text>
              {data.demographics.waist_circumference_cm && (
                <Text style={styles.textSmall}>
                  Окружность талии: {data.demographics.waist_circumference_cm} см
                </Text>
              )}
            </>
          )}

          {/* Области для улучшения */}
          {data.high_risk_categories.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Области для улучшения</Text>
              {data.high_risk_categories.map((category, index) => (
                <Text key={index} style={styles.bullet}>
                  • {categoryLabels[category] || category}
                </Text>
              ))}
            </>
          )}

          {/* Рекомендации */}
          {data.recommendations && data.recommendations.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Рекомендации</Text>
              {data.recommendations.map((rec, index) => (
                <Text key={index} style={styles.bullet}>
                  {index + 1}. {rec}
                </Text>
              ))}
            </>
          )}
        </View>

        {/* Футер */}
        <Text style={styles.footer}>
          Этот опросник не заменяет консультацию врача. Результаты носят информационный характер.
        </Text>
      </Page>
    </Document>
  )
}
