/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:23:45" or "45:30")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get public URL for Supabase Storage video (client-safe)
 */
export function getSupabaseVideoUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  // Remove trailing slash if present
  const baseUrl = supabaseUrl.replace(/\/$/, '')
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Get YouTube embed URL from video ID or URL
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Get Mave embed URL (if Mave provides embed functionality)
 */
export function getMaveEmbedUrl(videoIdOrUrl: string): string {
  // This will need to be updated based on Mave's actual embed URL format
  // For now, assuming similar structure to YouTube
  return videoIdOrUrl
}

