'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа')
      }

      // Токен уже установлен в cookie сервером
      // Перенаправляем на dashboard
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #f3e8ff, #ffffff, #e0f2fe)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(to bottom right, #8b5cf6, #06b6d4)',
            borderRadius: '1rem',
            marginBottom: '1rem'
          }}>
            🔒
          </div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: '#1f2937'
          }}>
            Админ-панель
          </h1>
          <p style={{ color: '#6b7280' }}>
            Войдите для доступа к панели управления
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{
              padding: '1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@bezpauzy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6'
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6'
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#9ca3af' : 'linear-gradient(to right, #7c3aed, #06b6d4)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.875rem', 
          color: '#6b7280' 
        }}>
          <p>Только для авторизованных администраторов</p>
        </div>
      </div>
    </div>
  )
}
