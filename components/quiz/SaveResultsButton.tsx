'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle2, AlertCircle, LogIn, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { saveMRSResults, saveInflammationResults, saveFRAXResults, saveWHRResults } from '@/lib/quiz/save-results'
import { savePhenoAgeResults } from '@/lib/quiz/save-results-phenoage'
import type { MRSResult, MRSAnswer } from '@/lib/types/mrs-quiz'
import type { InflammationResult, Demographics, InflammationAnswers } from '@/lib/types/inflammation-quiz'
import type { WHRResults, WHRAnswers } from '@/lib/types/whr-quiz'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { WebsiteLoginModal } from '@/components/auth/WebsiteLoginModal'

import type { PhenoAgeResult, PhenoAgeParams, BiomarkerAnalysis } from '@/lib/types/phenoage-quiz'

interface SaveResultsButtonProps {
  quizType: 'mrs' | 'inflammation' | 'phenoage' | 'frax' | 'whr'
  mrsData?: {
    result: MRSResult
    answers: MRSAnswer
  }
  inflammationData?: {
    result: InflammationResult
    demographics: Demographics
    answers: InflammationAnswers
  }
  phenoAgeData?: {
    result: PhenoAgeResult
    formData: PhenoAgeParams
    biomarkerAnalyses: BiomarkerAnalysis[]
  }
  fraxData?: {
    result: import('@/lib/types/frax-quiz').FRAXResults
    answers: import('@/lib/types/frax-quiz').FRAXAnswers
  }
  whrData?: {
    result: WHRResults
    answers: WHRAnswers
  }
}

export const SaveResultsButton: FC<SaveResultsButtonProps> = ({
  quizType,
  mrsData,
  inflammationData,
  phenoAgeData,
  fraxData,
  whrData
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error' | 'needs-auth'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showWebsiteLogin, setShowWebsiteLogin] = useState(false)
  // Сохраняем данные результатов в состоянии, чтобы использовать после регистрации
  const [pendingResults, setPendingResults] = useState<{
    quizType: 'mrs' | 'inflammation' | 'phenoage' | 'frax' | 'whr'
    mrsData?: { result: MRSResult; answers: MRSAnswer }
    inflammationData?: { result: InflammationResult; demographics: Demographics; answers: InflammationAnswers }
    phenoAgeData?: { result: PhenoAgeResult; formData: PhenoAgeParams; biomarkerAnalyses: BiomarkerAnalysis[] }
    fraxData?: { result: import('@/lib/types/frax-quiz').FRAXResults; answers: import('@/lib/types/frax-quiz').FRAXAnswers }
    whrData?: { result: WHRResults; answers: WHRAnswers }
  } | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      // Сохраняем данные в состоянии на случай, если понадобится сохранить после регистрации
      setPendingResults({
        quizType,
        mrsData,
        inflammationData,
        phenoAgeData,
        fraxData,
        whrData
      } as any)

      let result

      if (quizType === 'mrs' && mrsData) {
        result = await saveMRSResults(
          mrsData.result,
          mrsData.answers
        )
      } else if (quizType === 'inflammation' && inflammationData) {
        result = await saveInflammationResults(
          inflammationData.result,
          inflammationData.demographics,
          inflammationData.answers
        )
      } else if (quizType === 'phenoage' && phenoAgeData) {
        result = await savePhenoAgeResults(
          phenoAgeData.result,
          phenoAgeData.formData,
          phenoAgeData.biomarkerAnalyses
        )
      } else if (quizType === 'frax' && fraxData) {
        result = await saveFRAXResults(
          fraxData.result,
          fraxData.answers
        )
      } else if (quizType === 'whr' && whrData) {
        result = await saveWHRResults(
          whrData.result,
          whrData.answers
        )
      } else {
        setSaveStatus('error')
        setErrorMessage('Данные для сохранения не найдены')
        setIsSaving(false)
        return
      }

      if (result.success) {
        setSaveStatus('success')
        setPendingResults(null) // Очищаем после успешного сохранения
      } else {
        // Check if error is about authentication
        if (result.error?.includes('войти') || result.error?.includes('аккаунт') || result.error?.includes('авторизац')) {
          setSaveStatus('needs-auth')
        } else {
          setSaveStatus('error')
          setErrorMessage(result.error || 'Не удалось сохранить результаты')
        }
      }
    } catch (error) {
      console.error('Error saving results:', error)
      setSaveStatus('error')
      setErrorMessage('Произошла ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  // Функция для сохранения после успешной авторизации
  const handleSaveAfterAuth = async () => {
    if (!pendingResults) return

    setIsSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      let result

      if (pendingResults.quizType === 'mrs' && pendingResults.mrsData) {
        result = await saveMRSResults(
          pendingResults.mrsData.result,
          pendingResults.mrsData.answers
        )
      } else if (pendingResults.quizType === 'inflammation' && pendingResults.inflammationData) {
        result = await saveInflammationResults(
          pendingResults.inflammationData.result,
          pendingResults.inflammationData.demographics,
          pendingResults.inflammationData.answers
        )
      } else if (pendingResults.quizType === 'phenoage' && pendingResults.phenoAgeData) {
        result = await savePhenoAgeResults(
          pendingResults.phenoAgeData.result,
          pendingResults.phenoAgeData.formData,
          pendingResults.phenoAgeData.biomarkerAnalyses
        )
      } else if (pendingResults.quizType === 'frax' && pendingResults.fraxData) {
        result = await saveFRAXResults(
          pendingResults.fraxData.result,
          pendingResults.fraxData.answers
        )
      } else if (pendingResults.quizType === 'whr' && pendingResults.whrData) {
        result = await saveWHRResults(
          pendingResults.whrData.result,
          pendingResults.whrData.answers
        )
      } else {
        setSaveStatus('error')
        setErrorMessage('Данные для сохранения не найдены')
        setIsSaving(false)
        return
      }

      if (result.success) {
        setSaveStatus('success')
        setPendingResults(null)
      } else {
        setSaveStatus('error')
        setErrorMessage(result.error || 'Не удалось сохранить результаты')
      }
    } catch (error) {
      console.error('Error saving results after auth:', error)
      setSaveStatus('error')
      setErrorMessage('Произошла ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  if (saveStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-success/10 border border-success/20 rounded-full text-success">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-body font-medium">Результаты сохранены!</span>
        </div>
        <Link
          href="/community/quiz-results"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 border border-primary-purple/20 rounded-full text-deep-navy hover:from-primary-purple/20 hover:to-ocean-wave-start/20 transition-all text-body font-medium"
        >
          <span>Посмотреть в личном кабинете</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </motion.div>
    )
  }

  if (saveStatus === 'needs-auth') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-warning/10 border border-warning/20 rounded-full text-warning">
            <LogIn className="w-5 h-5" />
            <span className="text-body font-medium">Войдите в аккаунт для сохранения</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <span>Зарегистрироваться</span>
            </button>
            <button
              onClick={() => setShowWebsiteLogin(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple font-medium rounded-full hover:bg-primary-purple hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти</span>
            </button>
          </div>
        </motion.div>
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          skipTelegramLink={true}
          onSuccess={async () => {
            setShowRegisterModal(false)
            // Небольшая задержка для установки сессии
            await new Promise(resolve => setTimeout(resolve, 500))
            // После регистрации автоматически сохраняем результаты
            await handleSaveAfterAuth()
          }}
        />
        <WebsiteLoginModal
          isOpen={showWebsiteLogin}
          onClose={() => setShowWebsiteLogin(false)}
          onSuccess={async () => {
            setShowWebsiteLogin(false)
            // Небольшая задержка для установки сессии
            await new Promise(resolve => setTimeout(resolve, 500))
            // После входа автоматически сохраняем результаты
            await handleSaveAfterAuth()
          }}
          onSwitchToRegister={() => {
            setShowWebsiteLogin(false)
            setShowRegisterModal(true)
          }}
        />
      </>
    )
  }

  if (saveStatus === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-error/10 border border-error/20 rounded-full text-error">
          <AlertCircle className="w-5 h-5" />
          <span className="text-body font-medium">{errorMessage || 'Не удалось сохранить'}</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-body-small text-deep-navy/60 hover:text-primary-purple transition-colors"
        >
          Попробовать снова
        </button>
      </motion.div>
    )
  }

  return (
    <motion.button
      onClick={handleSave}
      disabled={isSaving}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-primary text-soft-white font-semibold rounded-full shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
      <span className="text-body font-semibold">
        {isSaving ? 'Сохранение...' : 'Сохранить мои результаты'}
      </span>
    </motion.button>
  )
}

