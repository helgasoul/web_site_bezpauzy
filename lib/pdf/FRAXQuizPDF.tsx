import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface FRAXQuizPDFData {
  hip_fracture_risk_10y: number
  major_osteoporotic_fracture_risk_10y: number
  risk_level: 'low' | 'moderate' | 'high'
  recommendations: string[]
  answers?: any
}

interface FRAXQuizPDFProps {
  data: FRAXQuizPDFData
}

const riskLabels: Record<string, string> = {
  low: 'Низкий риск',
  moderate: 'Умеренный риск',
  high: 'Высокий риск',
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
  headerSubtitle: {
    fontFamily: 'NotoSans',
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 30,
    paddingTop: 40,
  },
  title: {
    fontFamily: 'NotoSans',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a2e',
  },
  riskLevel: {
    fontFamily: 'NotoSans',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a2e',
  },
  riskBox: {
    backgroundColor: '#F5F3FF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    border: '1px solid #E8E5F2',
  },
  riskValue: {
    fontFamily: 'NotoSans',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B7FD6',
    marginBottom: 5,
    textAlign: 'center',
  },
  riskLabel: {
    fontFamily: 'NotoSans',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  subsectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1a2e',
  },
  bullet: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    marginBottom: 8,
    marginLeft: 10,
    color: '#333',
    lineHeight: 1.5,
  },
  footer: {
    fontFamily: 'NotoSans',
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})

export const FRAXQuizPDF: React.FC<FRAXQuizPDFProps> = ({ data }) => {
  const riskLabel = riskLabels[data.risk_level] || data.risk_level

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Хедер */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FRAX® - Оценка риска переломов</Text>
          <Text style={styles.headerSubtitle}>Результаты квиза</Text>
        </View>

        {/* Контент */}
        <View style={styles.content}>
          <Text style={styles.title}>Ваши результаты</Text>

          <Text style={styles.riskLevel}>
            Уровень риска: {riskLabel}
          </Text>

          {/* Риски */}
          <View style={styles.riskBox}>
            <Text style={styles.riskValue}>{data.hip_fracture_risk_10y}%</Text>
            <Text style={styles.riskLabel}>10-летний риск перелома бедра</Text>
          </View>

          <View style={styles.riskBox}>
            <Text style={styles.riskValue}>{data.major_osteoporotic_fracture_risk_10y}%</Text>
            <Text style={styles.riskLabel}>10-летний риск основных остеопоротических переломов</Text>
          </View>

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
          Это упрощённая оценка для образовательных целей. Для точной оценки используйте официальный FRAX калькулятор.
        </Text>
        <Text style={[styles.footer, { bottom: 10 }]}>
          Принесите эти результаты на приём к врачу для обсуждения необходимости лечения остеопороза.
        </Text>
      </Page>
    </Document>
  )
}
