-- Update severity CHECK constraint to include inflammation levels
-- This migration updates the existing constraint to allow all inflammation levels

-- First, drop the existing constraint
ALTER TABLE menohub_quiz_results 
DROP CONSTRAINT IF EXISTS menohub_quiz_results_severity_check;

-- Add the updated constraint with all valid values
ALTER TABLE menohub_quiz_results 
ADD CONSTRAINT menohub_quiz_results_severity_check 
CHECK (severity IN ('mild', 'moderate', 'severe', 'very_low', 'low', 'elevated', 'high'));

