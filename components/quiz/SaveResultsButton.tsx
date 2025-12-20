'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle2, AlertCircle, LogIn, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { saveMRSResults, saveInflammationResults, getUserEmail } from '@/lib/quiz/save-results'
import type { MRSResult, MRSAnswer } from '@/lib/types/mrs-quiz'
import type { InflammationResult, Demographics, InflammationAnswers } from '@/lib/types/inflammation-quiz'

interface SaveResultsButtonProps {
  quizType: 'mrs' | 'inflammation'
  mrsData?: {
    result: MRSResult
    answers: MRSAnswer
  }
  inflammationData?: {
    result: InflammationResult
    demographics: Demographics
    answers: InflammationAnswers
  }
}

export const SaveResultsButton: FC<SaveResultsButtonProps> = ({
  quizType,
  mrsData,
  inflammationData
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error' | 'needs-auth'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      const email = getUserEmail()
      
      console.log('🔍 SaveResultsButton: Checking email:', email)
      console.log('🔍 localStorage keys:', {
        menohub_user_email: typeof window !== 'undefined' ? localStorage.getItem('menohub_user_email') : null,
        user_email: typeof window !== 'undefined' ? localStorage.getItem('user_email') : null,
        bezpauzy_community_email: typeof window !== 'undefined' ? localStorage.getItem('bezpauzy_community_email') : null,
      })
      
      if (!email) {
        console.warn('⚠️ No email found in localStorage')
        setSaveStatus('needs-auth')
        setIsSaving(false)
        return
      }

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
      } else {
        setSaveStatus('error')
        setErrorMessage('Данные для сохранения не найдены')
        setIsSaving(false)
        return
      }

      if (result.success) {
        setSaveStatus('success')
      } else {
        // Check if error is about authentication
        if (result.error?.includes('войти') || result.error?.includes('аккаунт')) {
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
          href="/account/quiz-results"
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-warning/10 border border-warning/20 rounded-full text-warning">
          <LogIn className="w-5 h-5" />
          <span className="text-body font-medium">Войдите в аккаунт для сохранения</span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all text-center justify-center"
        >
          <LogIn className="w-4 h-4" />
          <span>Войти в аккаунт</span>
        </Link>
      </motion.div>
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
      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 border border-primary-purple/20 rounded-full text-deep-navy hover:from-primary-purple/20 hover:to-ocean-wave-start/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
      <span className="text-body font-medium">
        {isSaving ? 'Сохранение...' : 'Сохранить результаты'}
      </span>
    </motion.button>
  )
}

