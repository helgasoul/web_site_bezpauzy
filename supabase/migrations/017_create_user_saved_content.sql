-- Create table for user saved content (articles, quizzes, checklists)
CREATE TABLE IF NOT EXISTS menohub_user_saved_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT NOT NULL REFERENCES menohub_users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'quiz', 'checklist')),
  content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  metadata JSONB,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_menohub_user_saved_content_user_id ON menohub_user_saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_user_saved_content_type ON menohub_user_saved_content(content_type);
CREATE INDEX IF NOT EXISTS idx_menohub_user_saved_content_saved_at ON menohub_user_saved_content(saved_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_user_saved_content ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations through service role (API)
-- Access control is handled at the API level (checking user session)
-- This policy allows the API (using service role) to perform all operations
-- Using separate policies for better compatibility
CREATE POLICY "Allow all operations on user_saved_content_select"
  ON menohub_user_saved_content
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on user_saved_content_insert"
  ON menohub_user_saved_content
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all operations on user_saved_content_update"
  ON menohub_user_saved_content
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on user_saved_content_delete"
  ON menohub_user_saved_content
  FOR DELETE
  USING (true);

-- Add comment to table
COMMENT ON TABLE menohub_user_saved_content IS 'User saved content (articles, quizzes, checklists) for personal collection';

