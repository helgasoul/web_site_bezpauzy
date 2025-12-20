-- Create menohub_quiz_results table for storing MRS quiz results
CREATE TABLE IF NOT EXISTS menohub_quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES menohub_community_members(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    test_type TEXT DEFAULT 'mrs' CHECK (test_type IN ('mrs', 'menopause_stage', 'inflammation')),
    total_score INTEGER NOT NULL,
    vasomotor_score INTEGER NOT NULL,
    psychological_score INTEGER NOT NULL,
    urogenital_score INTEGER NOT NULL,
    somatic_score INTEGER NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'very_low', 'low', 'elevated', 'high')),
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_menohub_quiz_results_user_id ON menohub_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_menohub_quiz_results_email ON menohub_quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_menohub_quiz_results_created_at ON menohub_quiz_results(created_at DESC);

-- Enable Row Level Security
ALTER TABLE menohub_quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (will be restricted later with proper auth)
-- In production, you should add proper RLS policies based on your auth system
CREATE POLICY "Allow all operations on menohub_quiz_results"
    ON menohub_quiz_results
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION menohub_update_quiz_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS menohub_trigger_quiz_results_updated_at ON menohub_quiz_results;
CREATE TRIGGER menohub_trigger_quiz_results_updated_at
    BEFORE UPDATE ON menohub_quiz_results
    FOR EACH ROW
    EXECUTE FUNCTION menohub_update_quiz_results_updated_at();

