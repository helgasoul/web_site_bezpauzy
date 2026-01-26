-- Create feature_votes table to collect user feedback on features
CREATE TABLE IF NOT EXISTS feature_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER,
  feature_name TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per feature (can update)
  UNIQUE(user_id, feature_name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_name ON feature_votes(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id ON feature_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_votes_created_at ON feature_votes(created_at);

-- Enable RLS
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own votes
CREATE POLICY "Users can insert their own votes"
  ON feature_votes
  FOR INSERT
  WITH CHECK (true); -- Allow anonymous votes

-- Policy: Users can update their own votes
CREATE POLICY "Users can update their own votes"
  ON feature_votes
  FOR UPDATE
  USING (true); -- Allow anonymous updates

-- Policy: Anyone can read votes (for statistics)
CREATE POLICY "Anyone can read votes"
  ON feature_votes
  FOR SELECT
  USING (true);

-- Add comment
COMMENT ON TABLE feature_votes IS 'Stores user votes (up/down) for features in development';
COMMENT ON COLUMN feature_votes.feature_name IS 'Name of the feature (e.g., "reminder_health")';
COMMENT ON COLUMN feature_votes.vote_type IS 'Type of vote: "up" (yes/needed) or "down" (no/not needed)';
COMMENT ON COLUMN feature_votes.user_id IS 'Optional: user ID if user is authenticated, NULL for anonymous votes';

