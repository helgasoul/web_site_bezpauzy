import * as React from 'react'

interface WelcomeEmailProps {
  name: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name }) => {
  return (
    <html>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
        <table
          role="presentation"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#f5f5f5',
            padding: '20px',
          }}
        >
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table
                role="presentation"
                style={{
                  maxWidth: '600px',
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header with gradient */}
                <tr>
                  <td
                    style={{
                      background: 'linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%)',
                      padding: '40px 30px',
                      textAlign: 'center',
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        color: '#ffffff',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Добро пожаловать в сообщество «Без паузы»!
                    </h1>
                  </td>
                </tr>

                {/* Main content */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    <p
                      style={{
                        margin: '0 0 20px 0',
                        color: '#3D4461',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Здравствуйте, <strong>{name}</strong>!
                    </p>

                    <p
                      style={{
                        margin: '0 0 20px 0',
                        color: '#3D4461',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Спасибо, что присоединились к нашему сообществу! Мы рады, что вы с нами на этом важном этапе жизни.
                    </p>

                    <p
                      style={{
                        margin: '0 0 30px 0',
                        color: '#3D4461',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Теперь у вас есть доступ к:
                    </p>

                    {/* Features list */}
                    <table role="presentation" style={{ width: '100%', marginBottom: '30px' }}>
                      <tr>
                        <td style={{ padding: '15px', backgroundColor: '#E8E5F2', borderRadius: '8px', marginBottom: '10px' }}>
                          <p style={{ margin: '0', color: '#3D4461', fontSize: '15px', lineHeight: '1.6' }}>
                            <strong>💜 Тёплое и безопасное пространство</strong><br />
                            Общайтесь с другими участницами, делитесь опытом и получайте поддержку
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '15px', backgroundColor: '#E8E5F2', borderRadius: '8px', marginTop: '10px', marginBottom: '10px' }}>
                          <p style={{ margin: '0', color: '#3D4461', fontSize: '15px', lineHeight: '1.6' }}>
                            <strong>🔬 Ответы экспертов</strong><br />
                            Гинекологи, маммологи и нутрициологи отвечают на ваши вопросы простым языком
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '15px', backgroundColor: '#E8E5F2', borderRadius: '8px', marginTop: '10px', marginBottom: '10px' }}>
                          <p style={{ margin: '0', color: '#3D4461', fontSize: '15px', lineHeight: '1.6' }}>
                            <strong>📚 Библиотека ресурсов</strong><br />
                            Статьи, гайды и чек-листы для лучшего понимания менопаузы
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '15px', backgroundColor: '#E8E5F2', borderRadius: '8px', marginTop: '10px' }}>
                          <p style={{ margin: '0', color: '#3D4461', fontSize: '15px', lineHeight: '1.6' }}>
                            <strong>🎥 Вебинары и встречи</strong><br />
                            Регулярные эфиры с экспертами и практические рекомендации
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* CTA Button */}
                    <table role="presentation" style={{ width: '100%', marginBottom: '30px' }}>
                      <tr>
                        <td align="center" style={{ padding: '20px 0' }}>
                          <a
                            href="https://bezpauzy.ru/community"
                            style={{
                              display: 'inline-block',
                              padding: '14px 32px',
                              backgroundColor: '#8B7FD6',
                              color: '#ffffff',
                              textDecoration: 'none',
                              borderRadius: '50px',
                              fontSize: '16px',
                              fontWeight: '600',
                              fontFamily: 'Arial, sans-serif',
                            }}
                          >
                            Перейти в сообщество
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p
                      style={{
                        margin: '0 0 10px 0',
                        color: '#666666',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Помните: участие в сообществе полностью бесплатное, и мы всегда здесь, чтобы поддержать вас.
                    </p>

                    <p
                      style={{
                        margin: '20px 0 0 0',
                        color: '#666666',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      С уважением,<br />
                      <strong>Команда «Без паузы»</strong>
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      padding: '30px',
                      backgroundColor: '#f9f9f9',
                      textAlign: 'center',
                      borderTop: '1px solid #e0e0e0',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 10px 0',
                        color: '#999999',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      Вы получили это письмо, потому что зарегистрировались в сообществе «Без паузы»
                    </p>
                    <p
                      style={{
                        margin: '0',
                        color: '#999999',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      <a href="https://bezpauzy.ru/privacy" style={{ color: '#8B7FD6', textDecoration: 'none' }}>
                        Политика конфиденциальности
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

