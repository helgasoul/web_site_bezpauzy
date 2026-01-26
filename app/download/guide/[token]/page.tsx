import { Metadata } from 'next'
import { DownloadGuidePageClient } from '@/components/resources/DownloadGuidePageClient'

export const metadata: Metadata = {
  title: 'Скачать гайд | Без |Паузы',
  description: 'Скачивание вашего гайда',
  robots: 'noindex, nofollow',
}

interface DownloadGuidePageProps {
  params: Promise<{ token: string }>
}

export default async function DownloadGuidePage(props: DownloadGuidePageProps) {
  const params = await props.params
  const { token } = params

  return <DownloadGuidePageClient token={token} />
}

