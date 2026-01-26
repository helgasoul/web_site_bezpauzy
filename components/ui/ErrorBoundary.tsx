'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ошибку в консоль для отладки
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-soft-white p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-strong p-8 text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h1 className="text-h3 font-bold text-deep-navy mb-2">
              Произошла ошибка
            </h1>
            <p className="text-body text-deep-navy/70 mb-6">
              {process.env.NODE_ENV === 'development' && this.state.error
                ? this.state.error.message
                : 'Пожалуйста, обновите страницу или попробуйте позже.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-3 bg-primary-purple text-white rounded-full font-semibold hover:bg-primary-purple/90 transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
