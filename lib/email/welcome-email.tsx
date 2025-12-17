import * as React from 'react'

interface WelcomeEmailProps {
  name: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Добро пожаловать в сообщество «Без паузы»!</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f7' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f5f7' }}>
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(139, 127, 214, 0.15)' }}>
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

                {/* Content */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: '24px', color: '#3D4461' }}>
                      Здравствуйте, {name}!
                    </p>
                    <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: '24px', color: '#3D4461' }}>
                      Мы рады, что вы присоединились к нашему сообществу! Теперь у вас есть доступ ко всем возможностям:
                    </p>

                    <ul style={{ margin: '0 0 30px 0', paddingLeft: '20px', fontSize: '16px', lineHeight: '28px', color: '#3D4461' }}>
                      <li style={{ marginBottom: '10px' }}>Научно обоснованные ответы от экспертов</li>
                      <li style={{ marginBottom: '10px' }}>Поддержка женщин с похожим опытом</li>
                      <li style={{ marginBottom: '10px' }}>Регулярные вебинары и встречи</li>
                      <li style={{ marginBottom: '10px' }}>Библиотека ресурсов и материалов</li>
                    </ul>

                    <div style={{ textAlign: 'center', margin: '30px 0' }}>
                      <a
                        href="https://bezpauzy.com/community"
                        style={{
                          display: 'inline-block',
                          padding: '14px 32px',
                          backgroundColor: '#8B7FD6',
                          color: '#ffffff',
                          textDecoration: 'none',
                          borderRadius: '50px',
                          fontWeight: 'bold',
                          fontSize: '16px',
                        }}
                      >
                        Открыть сообщество
                      </a>
                    </div>

                    <p style={{ margin: '30px 0 0 0', fontSize: '14px', lineHeight: '20px', color: '#3D4461', opacity: 0.7 }}>
                      С уважением,<br />
                      Команда «Без паузы»
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ padding: '20px 30px', backgroundColor: '#E8E5F2', textAlign: 'center', fontSize: '12px', color: '#3D4461', opacity: 0.7 }}>
                    <p style={{ margin: 0 }}>
                      Вы получили это письмо, потому что присоединились к сообществу «Без паузы».<br />
                      Если вы не хотите получать наши письма, вы можете отписаться в любой момент.
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
