import { FC } from 'react'
import { Metadata } from 'next'
import { AccountDashboard } from '@/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'Личный кабинет | Без |Паузы',
  description: 'Управляйте своим аккаунтом, просматривайте результаты квизов и историю взаимодействий.',
}

const AccountPage: FC = () => {
  return <AccountDashboard />
}

export default AccountPage


