'use client'

import { FC, useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Calendar, CheckCircle2, ExternalLink, User, Phone, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface ConsultationConsentModalProps {
  isOpen: boolean
  onClose: () => void
  expertName: string
  expertRole: string
  expertCategory: 'mammologist' | 'gynecologist' | 'nutritionist'
  botLink: string
}

export const ConsultationConsentModal: FC<ConsultationConsentModalProps> = ({
  isOpen,
  onClose,
  expertName,
  expertRole,
  expertCategory,
  botLink,
}) => {
  const [step, setStep] = useState<'consent' | 'form'>('consent')
  const [agreeToPersonalData, setAgreeToPersonalData] = useState(false)
  const [agreeToThirdPartyConsent, setAgreeToThirdPartyConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [age, setAge] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [services, setServices] = useState<{
    mri?: boolean
    secondOpinion?: boolean
    mammography?: boolean
    online?: boolean
  }>({})

  const isMammologist = expertCategory === 'mammologist'
  const canProceed = agreeToPersonalData && agreeToThirdPartyConsent

  const handleConsentSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!agreeToPersonalData) {
      setError('Необходимо дать согласие на обработку персональных данных')
      return
    }

    if (!agreeToThirdPartyConsent) {
      setError('Необходимо дать согласие на передачу персональных данных третьему лицу (выбранному эксперту)')
      return
    }

    // Переходим к форме
    setStep('form')
    setError(null)
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Валидация
    if (!age || !phone || !name) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      setError('Пожалуйста, введите корректный возраст')
      return
    }

    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Пожалуйста, введите корректный номер телефона')
      return
    }

    if (isMammologist && Object.values(services).every(v => !v)) {
      setError('Пожалуйста, выберите хотя бы одну услугу')
      return
    }

    // Формируем данные для отправки
    const formData = {
      age: ageNum,
      name: name.trim(),
      phone: phone.trim(),
      expertCategory,
      expertName,
      services: isMammologist ? services : undefined,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    }

    // Сохраняем данные в localStorage (для последующей отправки в бота)
    localStorage.setItem('consultation_form_data', JSON.stringify(formData))
    localStorage.setItem('consultation_consent_given', new Date().toISOString())

    // Открываем бота (данные уже в localStorage, бот их подхватит)
    window.open(botLink, '_blank', 'noopener,noreferrer')

    // Закрываем модальное окно
    handleClose()
  }

  const handleClose = () => {
    setStep('consent')
    setAgreeToPersonalData(false)
    setAgreeToThirdPartyConsent(false)
    setAge('')
    setName('')
    setPhone('')
    setServices({})
    setError(null)
    onClose()
  }

  const handleBack = () => {
    setStep('consent')
    setError(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-lavender-bg px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-purple/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-purple" />
                  </div>
                  <div>
                    <h2 className="text-h4 font-bold text-deep-navy">
                      Запись на консультацию
                    </h2>
                    <p className="text-body-small text-deep-navy/70">
                      {expertName} — {expertRole}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-lavender-bg transition-colors text-deep-navy/70 hover:text-deep-navy"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              {step === 'consent' ? (
                <form onSubmit={handleConsentSubmit} className="p-6 md:p-8">
                  <div className="space-y-6">
                    {/* Consent Section */}
                    <div className="space-y-4">
                      <h3 className="text-h5 font-bold text-deep-navy">
                        Согласие на обработку персональных данных
                      </h3>
                      
                      <div className="bg-soft-white rounded-2xl p-6 border border-lavender-bg space-y-4">
                        <p className="text-body text-deep-navy/80 leading-relaxed">
                          Для записи на консультацию необходимо ваше согласие на обработку персональных данных и их передачу третьему лицу — выбранному эксперту ({expertName}). Данные для записи передаются эксперту в мессенджер Telegram.
                        </p>

                        {/* Personal Data Consent */}
                        <label className="flex items-start gap-4 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={agreeToPersonalData}
                            onChange={(e) => {
                              setAgreeToPersonalData(e.target.checked)
                              setError(null)
                            }}
                            className="mt-1 w-5 h-5 rounded border-2 border-primary-purple/30 text-primary-purple focus:ring-2 focus:ring-primary-purple focus:ring-offset-2 cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="text-body text-deep-navy font-medium mb-1">
                              Я даю согласие на обработку персональных данных
                            </p>
                            <p className="text-body-small text-deep-navy/70 leading-relaxed">
                              Я согласен(а) на обработку моих персональных данных (имя, возраст, контактные данные) 
                              для организации консультации в соответствии с{' '}
                              <Link 
                                href="/privacy" 
                                target="_blank"
                                className="text-primary-purple hover:underline font-medium"
                              >
                                Политикой конфиденциальности
                              </Link>
                              {' '}и{' '}
                              <Link 
                                href="/legal/offer" 
                                target="_blank"
                                className="text-primary-purple hover:underline font-medium"
                              >
                                Пользовательским соглашением
                              </Link>
                              .
                            </p>
                          </div>
                        </label>

                        {/* Согласие на передачу третьему лицу — для всех экспертов */}
                        <div className="pt-4 border-t border-lavender-bg">
                          <label className="flex items-start gap-4 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={agreeToThirdPartyConsent}
                              onChange={(e) => {
                                setAgreeToThirdPartyConsent(e.target.checked)
                                setError(null)
                              }}
                              className="mt-1 w-5 h-5 rounded border-2 border-primary-purple/30 text-primary-purple focus:ring-2 focus:ring-primary-purple focus:ring-offset-2 cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="text-body text-deep-navy font-medium mb-1">
                                Согласие на передачу персональных данных третьему лицу
                              </p>
                              <p className="text-body-small text-deep-navy/70 leading-relaxed">
                                {isMammologist ? (
                                  <>
                                    Я даю согласие на передачу моих персональных данных, включая медицинскую информацию, 
                                    третьим лицам (врачу-консультанту {expertName}, медицинским учреждениям) для организации консультации 
                                    и диагностических процедур. Данные передаются выбранному эксперту в мессенджер Telegram 
                                    и используются исключительно для целей медицинской консультации и диагностики.
                                  </>
                                ) : (
                                  <>
                                    Я даю согласие на передачу моих персональных данных выбранному эксперту ({expertName}) — третьему лицу — 
                                    для организации консультации. Данные передаются эксперту в мессенджер Telegram и используются 
                                    исключительно для связи и записи на приём.
                                  </>
                                )}
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-body-small text-red-700">{error}</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        className="flex-1 sm:flex-none"
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                        disabled={!canProceed}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Продолжить</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFormSubmit} className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-body-small text-deep-navy/70 mb-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="text-primary-purple hover:underline font-medium"
                      >
                        ← Назад к согласию
                      </button>
                    </div>

                    <h3 className="text-h5 font-bold text-deep-navy mb-2">
                      Заполните форму для записи
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-6">
                      После отправки вы будете перенаправлены в Telegram для завершения записи к {expertName}. Данные передаются выбранному эксперту.
                    </p>

                    {/* Age Field */}
                    <div className="space-y-2">
                      <label htmlFor="age" className="flex items-center gap-2 text-body font-semibold text-deep-navy">
                        <User className="w-5 h-5 text-primary-purple" />
                        Возраст *
                      </label>
                      <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="1"
                        max="150"
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all text-body text-deep-navy"
                        placeholder="Введите ваш возраст"
                      />
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="flex items-center gap-2 text-body font-semibold text-deep-navy">
                        <User className="w-5 h-5 text-primary-purple" />
                        Как к вам обращаться? *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all text-body text-deep-navy"
                        placeholder="Ваше имя"
                      />
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="flex items-center gap-2 text-body font-semibold text-deep-navy">
                        <Phone className="w-5 h-5 text-primary-purple" />
                        Номер телефона для связи *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all text-body text-deep-navy"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    {/* Services (only for mammologist) */}
                    {isMammologist && (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-body font-semibold text-deep-navy">
                          <FileText className="w-5 h-5 text-primary-purple" />
                          Выберите услуги *
                        </label>
                        <div className="bg-soft-white rounded-2xl p-4 border border-lavender-bg space-y-3">
                          {[
                            { key: 'mri', label: 'МРТ молочной железы' },
                            { key: 'secondOpinion', label: 'Второе мнение' },
                            { key: 'mammography', label: 'Маммография' },
                            { key: 'online', label: 'Онлайн консультация' },
                          ].map((service) => (
                            <label
                              key={service.key}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={services[service.key as keyof typeof services] || false}
                                onChange={(e) => {
                                  setServices({
                                    ...services,
                                    [service.key]: e.target.checked,
                                  })
                                }}
                                className="w-5 h-5 rounded border-2 border-primary-purple/30 text-primary-purple focus:ring-2 focus:ring-primary-purple focus:ring-offset-2 cursor-pointer"
                              />
                              <span className="text-body text-deep-navy group-hover:text-primary-purple transition-colors">
                                {service.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-body-small text-red-700">{error}</p>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleBack}
                        className="flex-1 sm:flex-none"
                      >
                        Назад
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Записаться на консультацию</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

