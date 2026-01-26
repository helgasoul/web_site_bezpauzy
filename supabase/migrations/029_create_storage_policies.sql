-- RLS Policies for epub-files bucket in Supabase Storage
-- These policies allow service role to access EPUB files for paid resources
-- 
-- IMPORTANT: Storage policies in Supabase are best created through the Dashboard:
-- 1. Go to Storage → Policies
-- 2. Select bucket 'epub-files'
-- 3. Create policies manually through the UI
--
-- If you need to create via SQL, use the following (remove IF NOT EXISTS):

-- Policy: Allow service role to read EPUB files
-- This is needed for the API route to download EPUB files
DROP POLICY IF EXISTS "epub_files_service_role_select" ON storage.objects;
CREATE POLICY "epub_files_service_role_select"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'epub-files');

-- Policy: Allow service role to upload EPUB files (for admin operations)
DROP POLICY IF EXISTS "epub_files_service_role_insert" ON storage.objects;
CREATE POLICY "epub_files_service_role_insert"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'epub-files');

-- Policy: Allow service role to update EPUB files
DROP POLICY IF EXISTS "epub_files_service_role_update" ON storage.objects;
CREATE POLICY "epub_files_service_role_update"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'epub-files')
WITH CHECK (bucket_id = 'epub-files');

-- Policy: Allow service role to delete EPUB files
DROP POLICY IF EXISTS "epub_files_service_role_delete" ON storage.objects;
CREATE POLICY "epub_files_service_role_delete"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'epub-files');

-- Note: These policies ensure that only the service role (used by API routes)
-- can access EPUB files. Regular users cannot access files directly.
-- Access is controlled through the /api/resources/download/[token] route.

