import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { FileText, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Публичная оферта | Без |Паузы',
  description: 'Публичная оферта на продажу цифровых товаров (электронных гайдов)',
  robots: 'index, follow',
}

const OfferPage: FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Публичная оферта
            </h1>
            <p className="text-body-large text-deep-navy/70">
              О продаже цифрового товара (электронного гайда)
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Внимание: Документ в разработке
                </h3>
                <p className="text-sm text-yellow-800">
                  Текст оферты находится на юридической проверке. Финальная версия будет опубликована после завершения проверки.
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                1. Общие положения
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  Настоящий документ является публичной офертой в адрес физических лиц о заключении договора купли-продажи цифрового товара.
                </p>
                <p>
                  <strong>Дата публикации:</strong> [Будет указана после юридической проверки]
                </p>
                <p>
                  <strong>Версия:</strong> 1.0
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                2. Предмет договора
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  Продавец обязуется передать Покупателю цифровой товар — электронный гайд в формате EPUB, а Покупатель обязуется принять и оплатить Товар.
                </p>
                <p>
                  Цена Товара: <strong>399 рублей</strong>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                3. Условия предоставления доступа
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  После успешной оплаты Покупателю предоставляется уникальная ссылка для скачивания Товара.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Срок действия ссылки:</strong> 30 календарных дней с момента оплаты</li>
                  <li><strong>Лимит скачиваний:</strong> 3 попытки в течение срока действия ссылки</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                4. Возврат средств
              </h2>
              <div className="text-body text-deep-navy/80 space-y-4">
                <p>
                  Возврат денежных средств за цифровой товар не производится, если Покупатель был уведомлен о предоставлении товара в цифровом виде и дал согласие на это.
                </p>
                <p className="text-sm text-deep-navy/60 italic">
                  * Полный текст раздела будет добавлен после юридической проверки
                </p>
              </div>
            </section>

            {/* Placeholder для остальных разделов */}
            <section className="border-t border-lavender-bg pt-8">
              <div className="bg-lavender-bg rounded-lg p-6 text-center">
                <p className="text-body text-deep-navy/70">
                  Полный текст оферты будет опубликован после завершения юридической проверки.
                </p>
                <p className="text-sm text-deep-navy/60 mt-2">
                  Ожидаемая дата публикации: [Будет указана]
                </p>
              </div>
            </section>

            {/* Back button */}
            <div className="pt-8 border-t border-lavender-bg">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start transition-colors font-medium"
              >
                ← Вернуться на главную
              </Link>
            </div>
          </div>

          {/* Note */}
          <div className="mt-8 text-center text-sm text-deep-navy/60">
            <p>
              По вопросам, связанным с офертой, обращайтесь на{' '}
              <a href="mailto:bez-pauzy@yandex.com" className="text-primary-purple hover:underline">
                bez-pauzy@yandex.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default OfferPage

