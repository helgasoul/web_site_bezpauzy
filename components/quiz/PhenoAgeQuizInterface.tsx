'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, AlertCircle, TrendingDown, CheckCircle2, ArrowLeft, ArrowRight, AlertTriangle, XCircle } from 'lucide-react'
import { calculatePhenoAge, analyzeBiomarkers } from '@/lib/phenoage-quiz/scoring'
import type { PhenoAgeParams } from '@/lib/types/phenoage-quiz'
import { referenceRanges } from '@/lib/phenoage-quiz/referenceRanges'
import { SaveResultsButton } from './SaveResultsButton'
import { DownloadQuizPDFButton } from './DownloadQuizPDFButton'
import { AskEvaQuizButton } from './AskEvaQuizButton'
import { DownloadLabChecklistButton } from './DownloadLabChecklistButton'
import { SaveToCollectionButton } from '@/components/ui/SaveToCollectionButton'
import { BackButton } from '@/components/ui/BackButton'

type QuizStep = 'intro' | 'form' | 'results'

interface PhenoAgeResult {
  phenoAge: number
  difference: number
  mortalityScore: number
  interpretation: string
  color: string
  icon: React.ReactNode
}

interface BiomarkerAnalysis {
  name: string
  value: number
  status: 'optimal' | 'normal' | 'warning' | 'danger'
  impact: string
  recommendation: string
}

export const PhenoAgeQuizInterface: FC = () => {
  const [step, setStep] = useState<QuizStep>('intro')
  const [formData, setFormData] = useState<Partial<PhenoAgeParams>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<PhenoAgeResult | null>(null)
  const [biomarkerAnalyses, setBiomarkerAnalyses] = useState<BiomarkerAnalysis[]>([])

  const handleInputChange = (key: keyof PhenoAgeParams, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) || value === '') {
      setFormData(prev => ({
        ...prev,
        [key]: value === '' ? undefined : numValue
      }))
      // Очищаем ошибку для этого поля
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[key]
          return newErrors
        })
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация
    const newErrors: Record<string, string> = {}
    const requiredFields: (keyof PhenoAgeParams)[] = ['age', 'albumin', 'creatinine', 'glucose', 'crp', 'lymph', 'mcv', 'rdw', 'alkphos', 'wbc']
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === undefined) {
        newErrors[field] = 'Это поле обязательно'
      } else {
        const range = referenceRanges[field]
        const value = formData[field] as number
        if (value < range.min || value > range.max) {
          newErrors[field] = `Значение должно быть в диапазоне ${range.min}-${range.max} ${range.unit}`
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Расчет результатов
    const fullData = formData as PhenoAgeParams
    const phenoAgeResult = calculatePhenoAge(fullData)
    const analyses = analyzeBiomarkers(fullData, referenceRanges)

    setBiomarkerAnalyses(analyses)
    setResult(phenoAgeResult)
    setStep('results')
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-soft-white to-white min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-card p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Calculator className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-h1 font-bold text-deep-navy mb-4">
                Калькулятор биологического возраста PhenoAge
              </h1>
              <p className="text-body-large text-deep-navy/70 max-w-2xl mx-auto">
                Определите свой биологический возраст на основе биохимических маркеров крови. 
                Научно обоснованная методика, разработанная учеными Йельского университета.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-2">Важно!</p>
                <p>
                  Этот калькулятор предназначен только для информационных целей и не заменяет 
                  консультацию врача. Результаты основаны на популяционных данных и могут иметь 
                  ограничения для индивидуальной оценки.
                </p>
              </div>
            </div>

            <div className="bg-lavender-bg rounded-xl p-6 mb-8">
              <h3 className="text-h4 font-semibold text-deep-navy mb-4">Что вам понадобится:</h3>
              <ul className="space-y-2 text-body text-deep-navy/80">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-purple rounded-full" />
                  <span>Результаты биохимического анализа крови</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-purple rounded-full" />
                  <span>Общий анализ крови</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-purple rounded-full" />
                  <span>Ваш возраст</span>
                </li>
              </ul>
            </div>

            <motion.button
              onClick={() => setStep('form')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>Начать расчет</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {step === 'form' && (
          <div
            key="form"
            className="bg-white rounded-3xl shadow-card p-8 md:p-12"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full"
            >
            <div className="mb-8">
              <h2 className="text-h2 font-bold text-deep-navy mb-3">
                Введите данные анализов
              </h2>
              <p className="text-body text-deep-navy/70">
                Укажите значения из ваших анализов крови
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {Object.entries(referenceRanges).map(([key, range]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-deep-navy mb-2">
                    {range.name}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData[key as keyof PhenoAgeParams] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        handleInputChange(key as keyof PhenoAgeParams, val)
                      }}
                      onBlur={(e) => {
                        const val = e.target.value
                        if (val) {
                          handleInputChange(key as keyof PhenoAgeParams, val)
                        }
                      }}
                      className={`w-full px-6 py-4 rounded-2xl border-2 bg-white text-body text-deep-navy focus:border-primary-purple focus:outline-none focus:ring-2 focus:ring-primary-purple/20 transition-all ${
                        errors[key] ? 'border-red-300 bg-red-50' : 'border-lavender-bg'
                      }`}
                      placeholder={`${range.min}-${range.max}`}
                      disabled={false}
                      readOnly={false}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-deep-navy/60">
                      {range.unit}
                    </span>
                  </div>
                  {errors[key] && (
                    <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                  )}
                  <p className="mt-1 text-xs text-deep-navy/50">
                    Норма: {range.min}-{range.max} {range.unit}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => setStep('intro')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-lavender-bg text-deep-navy font-semibold py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Назад</span>
              </motion.button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e as any)
                }}
                className="flex-1 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Рассчитать биологический возраст
              </button>
            </div>
            </form>
          </div>
        )}

        {step === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Основной результат */}
            <div className={`rounded-3xl border-2 p-8 ${result.color}`}>
              <div className="flex items-center gap-4 mb-6">
                {result.icon}
                <h2 className="text-h2 font-bold">Ваш биологический возраст</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white bg-opacity-70 rounded-xl p-6">
                  <p className="text-body-small opacity-75 mb-2">Биологический возраст</p>
                  <p className="text-4xl font-bold">{result.phenoAge} лет</p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-xl p-6">
                  <p className="text-body-small opacity-75 mb-2">Ваш возраст</p>
                  <p className="text-4xl font-bold">{formData.age} лет</p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-xl p-6">
                  <p className="text-body-small opacity-75 mb-2">Разница</p>
                  <p className="text-4xl font-bold">
                    {result.difference > 0 ? '+' : ''}{result.difference} лет
                  </p>
                </div>
              </div>

              <p className="text-body-large leading-relaxed">{result.interpretation}</p>
            </div>

            {/* Анализ биомаркеров */}
            {biomarkerAnalyses.length > 0 && (
              <div className="bg-white rounded-3xl shadow-card p-8">
                <h3 className="text-h3 font-semibold mb-6 text-deep-navy">Детальный анализ биомаркеров</h3>
                <div className="space-y-4">
                  {biomarkerAnalyses.map((analysis, index) => {
                    const getStatusColor = () => {
                      switch (analysis.status) {
                        case 'optimal':
                          return 'bg-green-50 border-green-200 text-green-800'
                        case 'normal':
                          return 'bg-blue-50 border-blue-200 text-blue-800'
                        case 'warning':
                          return 'bg-orange-50 border-orange-200 text-orange-800'
                        case 'danger':
                          return 'bg-red-50 border-red-200 text-red-800'
                        default:
                          return 'bg-gray-50 border-gray-200 text-gray-800'
                      }
                    }

                    const getStatusIcon = () => {
                      switch (analysis.status) {
                        case 'optimal':
                          return <CheckCircle2 className="w-5 h-5 text-green-600" />
                        case 'normal':
                          return <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        case 'warning':
                          return <AlertTriangle className="w-5 h-5 text-orange-600" />
                        case 'danger':
                          return <XCircle className="w-5 h-5 text-red-600" />
                        default:
                          return <AlertCircle className="w-5 h-5 text-gray-600" />
                      }
                    }

                    const getStatusLabel = () => {
                      switch (analysis.status) {
                        case 'optimal':
                          return 'Оптимально'
                        case 'normal':
                          return 'Норма'
                        case 'warning':
                          return 'Требует внимания'
                        case 'danger':
                          return 'Критично'
                        default:
                          return 'Не определено'
                      }
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-2xl border-2 p-6 ${getStatusColor()}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-h4 font-bold">{analysis.name}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">{analysis.value}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  analysis.status === 'optimal' ? 'bg-green-200 text-green-800' :
                                  analysis.status === 'normal' ? 'bg-blue-200 text-blue-800' :
                                  analysis.status === 'warning' ? 'bg-orange-200 text-orange-800' :
                                  'bg-red-200 text-red-800'
                                }`}>
                                  {getStatusLabel()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm mb-3 opacity-90">
                              <strong>Влияние:</strong> {analysis.impact}
                            </p>
                            <p className="text-sm font-medium">
                              <strong>Рекомендация:</strong> {analysis.recommendation}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Сравнение с популяцией */}
            <div className="bg-gradient-to-r from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl border-2 border-primary-purple/20 p-8">
              <h3 className="text-h3 font-semibold mb-6 text-deep-navy">Что это значит?</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/60 rounded-2xl p-6">
                  <h4 className="text-h4 font-semibold mb-3 text-deep-navy flex items-center gap-2">
                    <span>📈</span>
                    <span>Риск для здоровья</span>
                  </h4>
                  <p className="text-body text-deep-navy/80 mb-3">
                    При разнице <strong className="text-deep-navy">{result.difference > 0 ? '+' : ''}{result.difference} лет</strong>:
                  </p>
                  <ul className="space-y-2 text-body-small text-deep-navy/80">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-purple">•</span>
                      <span>
                        Риск смертности: <strong className="text-deep-navy">{Math.abs(result.difference * 9).toFixed(0)}%</strong> {result.difference > 0 ? 'выше' : 'ниже'} среднего
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-purple">•</span>
                      <span>
                        Риск ССЗ: <strong className="text-deep-navy">{Math.abs(result.difference * 10).toFixed(0)}%</strong> {result.difference > 0 ? 'выше' : 'ниже'} среднего
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/60 rounded-2xl p-6">
                  <h4 className="text-h4 font-semibold mb-3 text-deep-navy flex items-center gap-2">
                    <span>🎯</span>
                    <span>Ваша категория</span>
                  </h4>
                  <p className="text-body text-deep-navy/80">
                    {result.difference < -5 && 'Вы в топ-25% по биологическому возрасту! Продолжайте заботиться о здоровье.'}
                    {result.difference >= -5 && result.difference < 0 && 'Вы стареете медленнее среднего. Хорошая работа!'}
                    {result.difference >= 0 && result.difference <= 5 && 'Вы в среднем диапазоне популяции (50-75 процентиль).'}
                    {result.difference > 5 && result.difference <= 10 && 'Ваш биологический возраст выше среднего. Есть возможности для улучшения.'}
                    {result.difference > 10 && 'Требуется активное вмешательство для замедления старения.'}
                  </p>
                </div>
              </div>
            </div>

            {/* План действий */}
            <div className="bg-white rounded-3xl shadow-card p-8">
              <h3 className="text-h3 font-semibold mb-6 text-deep-navy flex items-center gap-2">
                <span>🎯</span>
                <span>Ваш персональный план</span>
              </h3>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-4 items-start p-5 bg-gradient-to-r from-lavender-bg to-primary-purple/5 rounded-2xl border border-primary-purple/10"
                >
                  <span className="text-3xl flex-shrink-0">1️⃣</span>
                  <div>
                    <h4 className="text-h4 font-semibold mb-2 text-deep-navy">Проконсультируйтесь с врачом</h4>
                    <p className="text-body text-deep-navy/70">Обсудите результаты с терапевтом или геронтологом</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4 items-start p-5 bg-gradient-to-r from-lavender-bg to-primary-purple/5 rounded-2xl border border-primary-purple/10"
                >
                  <span className="text-3xl flex-shrink-0">2️⃣</span>
                  <div>
                    <h4 className="text-h4 font-semibold mb-2 text-deep-navy">Сфокусируйтесь на проблемных маркерах</h4>
                    <p className="text-body text-deep-navy/70">
                      Работайте над показателями в оранжевой/красной зоне. Обратите внимание на:
                    </p>
                    <ul className="mt-2 space-y-1 text-body-small text-deep-navy/70">
                      {biomarkerAnalyses
                        .filter(m => m.status === 'warning' || m.status === 'danger')
                        .map((marker, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary-purple">•</span>
                            <span><strong>{marker.name}</strong>: {marker.recommendation}</span>
                          </li>
                        ))}
                      {biomarkerAnalyses.filter(m => m.status === 'warning' || m.status === 'danger').length === 0 && (
                        <li className="text-green-600 font-medium">Все ваши биомаркеры в норме! Продолжайте поддерживать здоровый образ жизни.</li>
                      )}
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 items-start p-5 bg-gradient-to-r from-lavender-bg to-primary-purple/5 rounded-2xl border border-primary-purple/10"
                >
                  <span className="text-3xl flex-shrink-0">3️⃣</span>
                  <div>
                    <h4 className="text-h4 font-semibold mb-2 text-deep-navy">Повторите тест через 6-12 месяцев</h4>
                    <p className="text-body text-deep-navy/70">Отслеживайте динамику изменений и эффективность ваших действий</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Рекомендации */}
            <div className="bg-white rounded-3xl shadow-card p-8">
              <h3 className="text-h3 font-semibold mb-4">Что влияет на биологический возраст?</h3>
              <ul className="space-y-3 text-body text-deep-navy/80">
                <li className="flex gap-3">
                  <span className="text-primary-purple text-xl">•</span>
                  <span><strong>Питание:</strong> Сбалансированная диета с ограничением сахара и обработанных продуктов</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-purple text-xl">•</span>
                  <span><strong>Физическая активность:</strong> Регулярные упражнения минимум 150 минут в неделю</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-purple text-xl">•</span>
                  <span><strong>Сон:</strong> Качественный сон 7-9 часов в сутки</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-purple text-xl">•</span>
                  <span><strong>Стресс:</strong> Управление стрессом через медитацию, йогу, хобби</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-purple text-xl">•</span>
                  <span><strong>Вредные привычки:</strong> Отказ от курения и умеренное потребление алкоголя</span>
                </li>
              </ul>
            </div>

            {/* Методология */}
            <div className="bg-lavender-bg rounded-3xl border border-primary-purple/10 p-8">
              <h3 className="text-h3 font-semibold mb-4">О калькуляторе PhenoAge</h3>
              <p className="text-body text-deep-navy/80 mb-3">
                PhenoAge - это калькулятор биологического возраста, разработанный учеными Йельского 
                университета (Morgan Levine et al., 2018). Он основан на анализе 9 биомаркеров крови 
                и хронологического возраста.
              </p>
              <p className="text-body-small text-deep-navy/70">
                <strong>Источник:</strong> Levine ME et al. &quot;An epigenetic biomarker of aging for 
                lifespan and healthspan.&quot; Aging (Albany NY). 2018;10(4):573-591.
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-6">
              {/* Сохранить результаты */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-6 border-2 border-primary-purple/20 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                  <h3 className="text-h5 font-semibold text-deep-navy">Сохранить результаты</h3>
                </div>
                <p className="text-body-small text-deep-navy/70 mb-4">
                  Сохраните результаты в личном кабинете, чтобы отслеживать изменения со временем
                </p>
                <SaveResultsButton
                  quizType="phenoage"
                  phenoAgeData={{
                    result,
                    formData: formData as PhenoAgeParams,
                    biomarkerAnalyses
                  }}
                />
              </motion.div>

              {/* Скачать результаты */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl p-8 border-2 border-primary-purple/20 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <TrendingDown className="w-6 h-6 text-primary-purple" />
                  <h3 className="text-h4 font-bold text-deep-navy">Скачать результаты</h3>
                </div>
                <p className="text-body text-deep-navy/70 mb-6">
                  Скачайте PDF с вашими результатами для консультации с врачом
                </p>
                <DownloadQuizPDFButton
                  quizType="phenoage"
                  quizData={{
                    phenoAge: result.phenoAge,
                    chronologicalAge: formData.age,
                    difference: result.difference,
                    interpretation: result.interpretation,
                    biomarkerAnalyses,
                    formData: formData as PhenoAgeParams
                  }}
                />
              </motion.div>

              {/* Спросить Еву */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <AskEvaQuizButton
                  quizType="phenoage"
                  quizResult={{
                    phenoAge: result.phenoAge,
                    difference: result.difference
                  }}
                />
              </motion.div>

              {/* Download Lab Checklist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 border-2 border-primary-purple/20 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-primary-purple" />
                  <h3 className="text-h4 font-bold text-deep-navy">Чек-лист лабораторных анализов</h3>
                </div>
                <p className="text-body text-deep-navy/70 mb-6">
                  Скачайте подробный чек-лист анализов, которые рекомендуется сдавать в период менопаузы. Возьмите его с собой на приём к врачу.
                </p>
                <DownloadLabChecklistButton label="Скачать чек-лист анализов" />
              </motion.div>

              {/* Save to Collection Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center"
              >
                <SaveToCollectionButton
                  contentType="quiz"
                  contentId="phenoage"
                  title="PhenoAge: биологический возраст"
                  description={`Биологический возраст: ${result.phenoAge.toFixed(1)} лет. Хронологический возраст: ${formData.age} лет. Разница: ${result.difference > 0 ? '+' : ''}${result.difference.toFixed(1)} лет.`}
                  url="/quiz/phenoage"
                  metadata={{
                    phenoAge: result.phenoAge,
                    chronologicalAge: formData.age,
                    difference: result.difference,
                  }}
                />
              </motion.div>
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={() => {
                  setStep('form')
                  setResult(null)
                  setBiomarkerAnalyses([])
                  setFormData({})
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-lavender-bg text-deep-navy font-semibold py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Пересчитать</span>
              </motion.button>
            </div>
          </motion.div>
        )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}