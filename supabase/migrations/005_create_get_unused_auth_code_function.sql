-- Функция для получения неиспользованного кода аутентификации
-- Используется в n8n workflow для обработки команды /code

CREATE OR REPLACE FUNCTION get_unused_auth_code()
RETURNS TABLE (
  id UUID,
  code TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    menohub_telegram_auth_codes.id,
    menohub_telegram_auth_codes.code,
    menohub_telegram_auth_codes.created_at
  FROM menohub_telegram_auth_codes
  WHERE menohub_telegram_auth_codes.telegram_id = 0
    AND menohub_telegram_auth_codes.used = FALSE
    AND menohub_telegram_auth_codes.expires_at > NOW()
  ORDER BY menohub_telegram_auth_codes.created_at DESC
  LIMIT 1;
END;
$$;

-- Комментарий
COMMENT ON FUNCTION get_unused_auth_code() IS 'Возвращает последний неиспользованный код аутентификации для обработки в Telegram боте';





