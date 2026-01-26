import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface MRSQuizPDFData {
  total_score: number
  severity: string
  vasomotor_score: number
  psychological_score: number
  urogenital_score: number
  somatic_score: number
  recommendations: string[]
}

interface MRSQuizPDFProps {
  data: MRSQuizPDFData
}

const severityLabels: Record<string, string> = {
  mild: 'Лёгкая',
  moderate: 'Умеренная',
  severe: 'Выраженная',
  no_symptoms: 'Отсутствуют',
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
  score: {
    fontFamily: 'NotoSans',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B7FD6',
    marginBottom: 10,
    textAlign: 'center',
  },
  severity: {
    fontFamily: 'NotoSans',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a2e',
  },
  subsectionTitle: {
    fontFamily: 'NotoSans',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1a2e',
  },
  textSmall: {
    fontFamily: 'NotoSans',
    fontSize: 11,
    marginBottom: 5,
    color: '#333',
    lineHeight: 1.5,
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

export const MRSQuizPDF: React.FC<MRSQuizPDFProps> = ({ data }) => {
  const severityLabel = severityLabels[data.severity] || data.severity

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Хедер */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menopause Rating Scale (MRS)</Text>
          <Text style={styles.headerSubtitle}>Результаты опросника</Text>
        </View>

        {/* Контент */}
        <View style={styles.content}>
          <Text style={styles.title}>Ваши результаты</Text>

          <Text style={styles.score}>{data.total_score}</Text>
          <Text style={styles.severity}>
            Степень тяжести: {severityLabel}
          </Text>

          {/* Детализация по категориям */}
          <Text style={styles.subsectionTitle}>Детализация по категориям</Text>
          
          <Text style={styles.textSmall}>
            Соматические симптомы: {data.somatic_score} баллов
          </Text>
          <Text style={styles.textSmall}>
            (приливы, сердцебиение, сон, боли)
          </Text>
          
          <Text style={styles.textSmall}>
            Психологические симптомы: {data.psychological_score} баллов
          </Text>
          <Text style={styles.textSmall}>
            (настроение, раздражительность, тревога, усталость)
          </Text>
          
          <Text style={styles.textSmall}>
            Урогенитальные симптомы: {data.urogenital_score} баллов
          </Text>
          <Text style={styles.textSmall}>
            (половая жизнь, мочевой пузырь, сухость)
          </Text>
          
          <Text style={styles.textSmall}>
            Вазомоторные симптомы: {data.vasomotor_score} баллов
          </Text>

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
        <Text style={[styles.footer, { bottom: 10 }]}>
          Принесите эти результаты на приём к гинекологу для обсуждения возможности ЗГТ или других методов лечения.
        </Text>
      </Page>
    </Document>
  )
}
