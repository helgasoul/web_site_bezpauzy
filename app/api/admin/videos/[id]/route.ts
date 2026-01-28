import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/videos/[id] - Get video by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data: video, error: queryError } = await supabase
      .from('menohub_video_content')
      .select('*')
      .eq('id', params.id)
      .single()

    if (queryError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('❌ [Admin Video Detail] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/videos/[id] - Update video
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const supabase = createServiceRoleClient()

    // Check if video exists
    const { data: existingVideo } = await supabase
      .from('menohub_video_content')
      .select('id, published')
      .eq('id', params.id)
      .single()

    if (!existingVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updates: any = {}

    if (body.title !== undefined) updates.title = body.title
    if (body.slug !== undefined) updates.slug = body.slug
    if (body.description !== undefined) updates.description = body.description
    if (body.content_type !== undefined) updates.content_type = body.content_type
    if (body.video_url !== undefined) updates.video_url = body.video_url
    if (body.video_type !== undefined) updates.video_type = body.video_type
    if (body.video_id !== undefined) updates.video_id = body.video_id
    if (body.storage_bucket !== undefined) updates.storage_bucket = body.storage_bucket
    if (body.storage_path !== undefined) updates.storage_path = body.storage_path
    if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url
    if (body.duration !== undefined) updates.duration = body.duration
    if (body.category !== undefined) updates.category = body.category
    if (body.category_name !== undefined) updates.category_name = body.category_name
    if (body.meta_title !== undefined) updates.meta_title = body.meta_title
    if (body.meta_description !== undefined) updates.meta_description = body.meta_description
    if (body.meta_keywords !== undefined) updates.meta_keywords = body.meta_keywords
    if (body.access_level !== undefined) updates.access_level = body.access_level
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.transcript !== undefined) updates.transcript = body.transcript
    if (body.timestamps !== undefined) updates.timestamps = body.timestamps
    if (body.related_articles !== undefined) updates.related_articles = body.related_articles
    if (body.related_videos !== undefined) updates.related_videos = body.related_videos

    // Handle published status and timestamp
    if (body.published !== undefined) {
      updates.published = body.published
      if (body.published && !existingVideo.published) {
        // Publishing for the first time
        updates.published_at = new Date().toISOString()
      } else if (!body.published) {
        // Unpublishing
        updates.published_at = null
      }
    }

    // Podcast-specific fields
    if (body.podcast_series !== undefined) updates.podcast_series = body.podcast_series
    if (body.guest_expert_id !== undefined) updates.guest_expert_id = body.guest_expert_id
    if (body.guest_expert_name !== undefined) updates.guest_expert_name = body.guest_expert_name
    if (body.guest_expert_role !== undefined) updates.guest_expert_role = body.guest_expert_role
    if (body.guest_expert_avatar !== undefined) updates.guest_expert_avatar = body.guest_expert_avatar
    if (body.host_name !== undefined) updates.host_name = body.host_name

    // Eva explains
    if (body.topic !== undefined) updates.topic = body.topic

    // Doctors explain
    if (body.doctor_id !== undefined) updates.doctor_id = body.doctor_id
    if (body.doctor_name !== undefined) updates.doctor_name = body.doctor_name
    if (body.doctor_specialty !== undefined) updates.doctor_specialty = body.doctor_specialty
    if (body.doctor_credentials !== undefined) updates.doctor_credentials = body.doctor_credentials
    if (body.doctor_avatar !== undefined) updates.doctor_avatar = body.doctor_avatar

    // Update video
    const { data: video, error: updateError } = await supabase
      .from('menohub_video_content')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [Admin Video Update] Error:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to update video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ video })
  } catch (error: any) {
    console.error('❌ [Admin Video Update] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/videos/[id] - Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super_admin can delete videos' },
        { status: 403 }
      )
    }

    const supabase = createServiceRoleClient()

    const { error: deleteError } = await supabase
      .from('menohub_video_content')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('❌ [Admin Video Delete] Error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [Admin Video Delete] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
