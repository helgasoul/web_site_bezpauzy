-- Add order_number column to menohub_book_orders
ALTER TABLE menohub_book_orders 
    ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Add order_number column to menohub_resource_purchases
ALTER TABLE menohub_resource_purchases 
    ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Create indexes for order_number
CREATE INDEX IF NOT EXISTS idx_menohub_book_orders_order_number ON menohub_book_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_order_number ON menohub_resource_purchases(order_number);

-- Function to generate unique order number
-- Format: ORDER-YYYYMMDD-NNNNN (where NNNNN is a 5-digit sequential number for the day)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    today DATE := CURRENT_DATE;
    today_prefix TEXT := 'ORDER-' || TO_CHAR(today, 'YYYYMMDD') || '-';
    max_order_number TEXT;
    next_number INTEGER := 1;
    new_order_number TEXT;
BEGIN
    -- Find the highest order number for today from both tables
    SELECT MAX(order_number) INTO max_order_number
    FROM (
        SELECT order_number FROM menohub_book_orders WHERE order_number LIKE today_prefix || '%'
        UNION ALL
        SELECT order_number FROM menohub_resource_purchases WHERE order_number LIKE today_prefix || '%'
    ) AS all_orders
    WHERE order_number IS NOT NULL;

    -- Extract the number part and increment
    IF max_order_number IS NOT NULL THEN
        next_number := CAST(SUBSTRING(max_order_number FROM LENGTH(today_prefix) + 1) AS INTEGER) + 1;
    END IF;

    -- Format as 5-digit number with leading zeros
    new_order_number := today_prefix || LPAD(next_number::TEXT, 5, '0');

    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON COLUMN menohub_book_orders.order_number IS 'Human-readable unique order number. Format: ORDER-YYYYMMDD-NNNNN';
COMMENT ON COLUMN menohub_resource_purchases.order_number IS 'Human-readable unique order number. Format: ORDER-YYYYMMDD-NNNNN';
COMMENT ON FUNCTION generate_order_number() IS 'Generates a unique order number for the current day. Format: ORDER-YYYYMMDD-NNNNN where NNNNN is a 5-digit sequential number starting from 00001 each day.';
