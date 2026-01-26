import { FC } from 'react'

interface StructuredDataProps {
  data: object | object[]
}

/**
 * Компонент для вставки структурированных данных Schema.org (JSON-LD)
 * Server Component - не требует клиентской логики
 */
export const StructuredData: FC<StructuredDataProps> = ({ data }) => {
  const jsonLd = Array.isArray(data) ? data : [data]

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item, null, 0) }}
        />
      ))}
    </>
  )
}

