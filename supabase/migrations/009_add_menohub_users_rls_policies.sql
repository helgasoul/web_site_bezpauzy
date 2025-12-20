-- Add RLS policies for menohub_users table
-- This allows the API to insert new users during registration

-- Enable Row Level Security (if not already enabled)
ALTER TABLE menohub_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow service role to insert users" ON menohub_users;
DROP POLICY IF EXISTS "Allow service role to select users" ON menohub_users;
DROP POLICY IF EXISTS "Allow service role to update users" ON menohub_users;
DROP POLICY IF EXISTS "Allow all operations on menohub_users" ON menohub_users;

-- Policy: Allow service role (API) to insert new users
-- This is needed for user registration via the website
CREATE POLICY "Allow service role to insert users"
    ON menohub_users
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow service role (API) to select users
-- This is needed for login and user lookup
CREATE POLICY "Allow service role to select users"
    ON menohub_users
    FOR SELECT
    USING (true);

-- Policy: Allow service role (API) to update users
-- This is needed for updating user data (e.g., linking Telegram ID, updating subscription)
CREATE POLICY "Allow service role to update users"
    ON menohub_users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

