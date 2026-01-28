-- Add 'doctors_explain' content type to menohub_video_content
-- Врачи Объясняют (Doctors Explain section)

-- Drop existing constraint
ALTER TABLE menohub_video_content
DROP CONSTRAINT IF EXISTS menohub_video_content_content_type_check;

-- Add new constraint with doctors_explain
ALTER TABLE menohub_video_content
ADD CONSTRAINT menohub_video_content_content_type_check
CHECK (content_type IN ('podcast', 'eva_explains', 'doctors_explain'));

-- Add doctor-specific fields (similar to guest_expert but for doctors_explain)
ALTER TABLE menohub_video_content
ADD COLUMN IF NOT EXISTS doctor_id BIGINT, -- References menohub_users(id) if doctor has account
ADD COLUMN IF NOT EXISTS doctor_name TEXT, -- Name of the doctor (e.g., "Смирнова Анна")
ADD COLUMN IF NOT EXISTS doctor_specialty TEXT, -- Specialty (e.g., "Кардиолог", "Эндокринолог")
ADD COLUMN IF NOT EXISTS doctor_credentials TEXT, -- Credentials (e.g., "к.м.н., высшая категория")
ADD COLUMN IF NOT EXISTS doctor_avatar TEXT; -- URL to doctor avatar

-- Add index for doctors_explain content
CREATE INDEX IF NOT EXISTS idx_menohub_video_content_doctor_name
ON menohub_video_content(doctor_name)
WHERE content_type = 'doctors_explain';

-- Update video_type constraint to support more platforms
ALTER TABLE menohub_video_content
DROP CONSTRAINT IF EXISTS menohub_video_content_video_type_check;

ALTER TABLE menohub_video_content
ADD CONSTRAINT menohub_video_content_video_type_check
CHECK (video_type IN ('youtube', 'mave', 'supabase', 'vimeo', 'direct', 'telegram'));

COMMENT ON COLUMN menohub_video_content.content_type IS 'Type: podcast, eva_explains, or doctors_explain';
COMMENT ON COLUMN menohub_video_content.doctor_name IS 'Doctor name for doctors_explain content type';
COMMENT ON COLUMN menohub_video_content.doctor_specialty IS 'Medical specialty for doctors_explain content type';
COMMENT ON COLUMN menohub_video_content.doctor_credentials IS 'Academic degrees and credentials';
