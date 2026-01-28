export default function SimpleLoginPage() {
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
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          textAlign: 'center',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Админ-панель
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Простая тестовая страница
        </p>
        <div style={{
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#4b5563' }}>
            Если вы видите это, значит маршрутизация работает!
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            URL: /admin/login-simple
          </p>
        </div>
      </div>
    </div>
  )
}
