-- Ensure test_type constraint includes 'inflammation'
-- This migration ensures the constraint is correct after the user_id type change

-- Drop existing constraint if it exists
ALTER TABLE menohub_quiz_results 
DROP CONSTRAINT IF EXISTS menohub_quiz_results_test_type_check;

-- Recreate constraint with all valid test types
ALTER TABLE menohub_quiz_results 
ADD CONSTRAINT menohub_quiz_results_test_type_check 
CHECK (test_type IN ('mrs', 'menopause_stage', 'inflammation'));

-- Also ensure severity constraint is correct
ALTER TABLE menohub_quiz_results 
DROP CONSTRAINT IF EXISTS menohub_quiz_results_severity_check;

ALTER TABLE menohub_quiz_results 
ADD CONSTRAINT menohub_quiz_results_severity_check 
CHECK (severity IN ('mild', 'moderate', 'severe', 'very_low', 'low', 'elevated', 'high'));

