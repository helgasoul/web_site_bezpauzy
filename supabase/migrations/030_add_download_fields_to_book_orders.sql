-- Add download fields to menohub_book_orders for digital book downloads
ALTER TABLE menohub_book_orders
ADD COLUMN IF NOT EXISTS download_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS download_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_downloads INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS epub_file_path TEXT; -- Path to EPUB file in storage (e.g., 'epub-files/book.epub')

-- Create index for download_token
CREATE INDEX IF NOT EXISTS idx_book_orders_download_token ON menohub_book_orders(download_token);

-- Add comments
COMMENT ON COLUMN menohub_book_orders.download_token IS 'Unique UUID token for download link. Valid for 30 days (digital books only).';
COMMENT ON COLUMN menohub_book_orders.download_token_expires_at IS 'Expiration date for download token (30 days from purchase, digital books only).';
COMMENT ON COLUMN menohub_book_orders.download_count IS 'Number of times the book was downloaded (digital books only).';
COMMENT ON COLUMN menohub_book_orders.max_downloads IS 'Maximum number of downloads allowed (default 10, digital books only).';
COMMENT ON COLUMN menohub_book_orders.epub_file_path IS 'Path to EPUB file in Supabase Storage (e.g., epub-files/book.epub).';

