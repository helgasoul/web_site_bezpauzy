'use client'

import { FC } from 'react'
import { BookHero } from '@/components/book/BookHero'
import { BookTableOfContents } from '@/components/book/BookTableOfContents'
import { BookAuthorBio } from '@/components/book/BookAuthorBio'
import { BookBonusOffer } from '@/components/book/BookBonusOffer'
import { BookPreOrderForm } from '@/components/book/BookPreOrderForm'
import { BookFAQ } from '@/components/book/BookFAQ'
import { BookPurchaseStatus } from '@/components/book/BookPurchaseStatus'
import { BackButton } from '@/components/ui/BackButton'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

export const BookPage: FC = () => {
  // Получаем email из localStorage (если был сохранен после покупки)
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('purchase_email') : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <BookPurchaseStatus email={savedEmail} />
      </div>
      <BookHero />
      <BookTableOfContents />
      <BookAuthorBio />
      <BookBonusOffer />
      <BookPreOrderForm />
      <BookFAQ />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <MedicalDisclaimer variant="full" />
      </div>
    </main>
  )
}

