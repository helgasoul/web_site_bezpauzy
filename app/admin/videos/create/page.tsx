'use client'

import VideoContentForm from '@/components/admin/VideoContentForm'

export default function CreateVideoPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <VideoContentForm mode="create" />
    </div>
  )
}
