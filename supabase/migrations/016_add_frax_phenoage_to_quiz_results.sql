-- Add 'frax' and 'phenoage' to test_type constraint in menohub_quiz_results
-- This migration updates the CHECK constraint to include the new quiz types

-- Drop existing constraint if it exists
ALTER TABLE menohub_quiz_results 
DROP CONSTRAINT IF EXISTS menohub_quiz_results_test_type_check;

-- Recreate constraint with all valid test types including 'frax' and 'phenoage'
ALTER TABLE menohub_quiz_results 
ADD CONSTRAINT menohub_quiz_results_test_type_check 
CHECK (test_type IN ('mrs', 'menopause_stage', 'inflammation', 'phenoage', 'frax'));

