-- Replace "ТОПИКАЛЬНО" / "Топикально" / "топикально" with "накожно" in all blog posts content
-- This migration updates all occurrences of the word "топикально" (in any case) to "накожно" in the content field of blog_posts table

UPDATE menohub_blog_posts
SET 
  content = REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        content,
        'ТОПИКАЛЬНО',
        'НАКОЖНО',
        'gi' -- case-insensitive, global replacement
      ),
      'Топикально',
      'Накожно',
      'g'
    ),
    'топикально',
    'накожно',
    'g'
  ),
  updated_at = NOW()
WHERE 
  content ILIKE '%топикально%' 
  OR content ILIKE '%ТОПИКАЛЬНО%'
  OR content ILIKE '%Топикально%';

-- Also update in title and description if needed
UPDATE menohub_blog_posts
SET 
  title = REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        title,
        'ТОПИКАЛЬНО',
        'НАКОЖНО',
        'gi'
      ),
      'Топикально',
      'Накожно',
      'g'
    ),
    'топикально',
    'накожно',
    'g'
  ),
  updated_at = NOW()
WHERE 
  title ILIKE '%топикально%' 
  OR title ILIKE '%ТОПИКАЛЬНО%'
  OR title ILIKE '%Топикально%';

UPDATE menohub_blog_posts
SET 
  description = REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        description,
        'ТОПИКАЛЬНО',
        'НАКОЖНО',
        'gi'
      ),
      'Топикально',
      'Накожно',
      'g'
    ),
    'топикально',
    'накожно',
    'g'
  ),
  updated_at = NOW()
WHERE 
  description ILIKE '%топикально%' 
  OR description ILIKE '%ТОПИКАЛЬНО%'
  OR description ILIKE '%Топикально%';
