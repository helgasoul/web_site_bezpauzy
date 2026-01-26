import { Metadata } from 'next'
import { CartPage } from '@/components/cart/CartPage'

export const metadata: Metadata = {
  title: 'Корзина | Без |Паузы',
  description: 'Оформите заказ на книги и ресурсы для женщин в менопаузе',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartPageRoute() {
  return <CartPage />
}
