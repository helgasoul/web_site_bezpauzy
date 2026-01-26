import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface PhenoAgeQuizPDFData {
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

interface PhenoAgeQuizPDFProps {
  data: PhenoAgeQuizPDFData
}

const statusLabels: Record<string, string> = {
  optimal: 'Оптимально',
  normal: 'Норма',
  warning: 'Требует внимания',
  danger: 'Критично',
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
  resultBox: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    border: '1px solid #e0e0e0',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontFamily: 'NotoSans',
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontFamily: 'NotoSans',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B7FD6',
  },
  interpretation: {
    fontFamily: 'NotoSans',
    fontSize: 12,
    lineHeight: 1.6,
    marginTop: 15,
    color: '#333',
  },
  sectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#1a1a2e',
  },
  biomarkerCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    border: '1px solid #e0e0e0',
  },
  biomarkerName: {
    fontFamily: 'NotoSans',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a2e',
  },
  biomarkerValue: {
    fontFamily: 'NotoSans',
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
  },
  biomarkerImpact: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    marginBottom: 5,
    color: '#555',
    lineHeight: 1.4,
  },
  biomarkerRecommendation: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B7FD6',
    lineHeight: 1.4,
  },
  disclaimerBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 5,
  },
  disclaimerText: {
    fontFamily: 'NotoSans',
    fontSize: 10,
    color: '#856404',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    fontFamily: 'NotoSans',
  },
})

export const PhenoAgeQuizPDF: React.FC<PhenoAgeQuizPDFProps> = ({ data }) => {
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return '#10b981'
      case 'normal':
        return '#3b82f6'
      case 'warning':
        return '#f59e0b'
      case 'danger':
        return '#ef4444'
      default:
        return '#666'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Биологический возраст PhenoAge</Text>
          <Text style={styles.headerSubtitle}>Результаты анализа • {currentDate}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Основные результаты */}
          <View style={styles.resultBox}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Биологический возраст:</Text>
              <Text style={styles.resultValue}>{data.phenoAge.toFixed(1)} лет</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Хронологический возраст:</Text>
              <Text style={styles.resultValue}>{data.chronologicalAge.toFixed(1)} лет</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Разница:</Text>
              <Text style={[styles.resultValue, { color: data.difference > 0 ? '#ef4444' : '#10b981' }]}>
                {data.difference > 0 ? '+' : ''}{data.difference.toFixed(1)} лет
              </Text>
            </View>
            <Text style={styles.interpretation}>
              {data.interpretation}
            </Text>
          </View>

          {/* Анализ биомаркеров */}
          {data.biomarkerAnalyses && data.biomarkerAnalyses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Детальный анализ биомаркеров</Text>
              {data.biomarkerAnalyses.map((marker, index) => (
                <View key={index} style={styles.biomarkerCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={styles.biomarkerName}>{marker.name}</Text>
                    <Text style={[styles.biomarkerValue, { color: getStatusColor(marker.status) }]}>
                      {marker.value} ({statusLabels[marker.status] || marker.status})
                    </Text>
                  </View>
                  <Text style={styles.biomarkerImpact}>
                    <Text style={{ fontFamily: 'NotoSans', fontWeight: 'bold' }}>Влияние: </Text>
                    {marker.impact}
                  </Text>
                  <Text style={styles.biomarkerRecommendation}>
                    💡 {marker.recommendation}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Исходные данные */}
          <Text style={styles.sectionTitle}>Исходные данные анализов</Text>
          <View style={styles.resultBox}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Альбумин:</Text>
              <Text style={styles.resultValue}>{data.formData.albumin} г/дл</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Креатинин:</Text>
              <Text style={styles.resultValue}>{data.formData.creatinine} мг/дл</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Глюкоза:</Text>
              <Text style={styles.resultValue}>{data.formData.glucose} мг/дл</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>C-реактивный белок:</Text>
              <Text style={styles.resultValue}>{data.formData.crp} мг/л</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Лимфоциты:</Text>
              <Text style={styles.resultValue}>{data.formData.lymph}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>MCV:</Text>
              <Text style={styles.resultValue}>{data.formData.mcv} фл</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>RDW:</Text>
              <Text style={styles.resultValue}>{data.formData.rdw}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Щелочная фосфатаза:</Text>
              <Text style={styles.resultValue}>{data.formData.alkphos} Ед/л</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Лейкоциты:</Text>
              <Text style={styles.resultValue}>{data.formData.wbc} ×10⁹/л</Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              ⚠️ Этот калькулятор предназначен только для информационных целей и не заменяет консультацию врача. 
              Результаты основаны на популяционных данных и могут иметь ограничения для индивидуальной оценки.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Без |Паузы • bezpauzy.com • Результаты сгенерированы {currentDate}
        </Text>
      </Page>
    </Document>
  )
}
