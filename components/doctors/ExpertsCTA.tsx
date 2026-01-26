'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const ExpertsCTA = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center text-white"
        >
          <h2 className="text-h2 font-bold mb-6">
            Нужна научно обоснованная информация?
          </h2>
          <p className="text-h5 mb-8 text-white/90">
            Наш AI-ассистент Ева ответит на ваши вопросы о женском здоровье 40+ и менопаузе на основе валидированной врачом научной базы данных. 
            Основано на академических публикациях, международных рекомендациях и клинических исследованиях.
          </p>
          <Link href="/bot">
            <Button variant="ghost" className="text-white border-white hover:bg-white/10">
              Узнать больше о Еве
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

