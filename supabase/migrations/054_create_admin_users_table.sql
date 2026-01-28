-- ============================================
-- Таблица для админов и система ролей (RBAC)
-- ============================================
-- Используется для управления доступом к админ-панели
-- ============================================

-- Таблица для админов
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES menohub_users(id) ON DELETE SET NULL, -- Связь с основным пользователем (опционально)
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'order_manager', 'support_manager', 'analyst')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0, -- Для защиты от брутфорса
  locked_until TIMESTAMPTZ, -- Время до разблокировки после неудачных попыток
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL, -- Кто создал этого админа
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active) WHERE is_active = TRUE;

-- Таблица для настроек админ-панели
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL, -- 'yookassa_shop_id', 'telegram_bot_token', etc.
  value TEXT, -- Зашифрованное значение (для чувствительных данных)
  encrypted BOOLEAN DEFAULT TRUE, -- Зашифровано ли значение
  category TEXT NOT NULL, -- 'payments', 'integrations', 'email', 'ai', 'analytics', 'general'
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Индексы для настроек
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);

-- Таблица для настроек уведомлений админов
CREATE TABLE IF NOT EXISTS admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'new_order', 'order_status_change', 'new_contact', 'new_subscriber', 'critical_error'
  email_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE, -- Уведомления в админ-панели
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id, notification_type)
);

-- Индексы для настроек уведомлений
CREATE INDEX IF NOT EXISTS idx_admin_notification_settings_admin_id ON admin_notification_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notification_settings_type ON admin_notification_settings(notification_type);

-- Таблица для in-app уведомлений
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_order', 'order_status_change', 'new_contact', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Ссылка на соответствующий раздел (например, '/admin/orders/123')
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для уведомлений
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- Таблица для audit log (история действий админов)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  entity_type TEXT, -- 'blog_post', 'order', 'user', 'settings', etc.
  entity_id TEXT, -- ID сущности
  changes JSONB, -- Изменения (для update)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity_type ON admin_audit_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- RLS политики для admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Только активные админы могут видеть других админов (для списка)
CREATE POLICY "Active admins can view other admins"
  ON admin_users FOR SELECT
  USING (
    is_active = TRUE AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id::TEXT = current_setting('app.current_admin_id', TRUE)
      AND is_active = TRUE
    )
  );

-- Только суперадмины могут создавать админов
CREATE POLICY "Super admins can create admins"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id::TEXT = current_setting('app.current_admin_id', TRUE)
      AND role = 'super_admin'
      AND is_active = TRUE
    )
  );

-- Админы могут обновлять только свой профиль (кроме суперадминов)
CREATE POLICY "Admins can update their own profile"
  ON admin_users FOR UPDATE
  USING (
    id::TEXT = current_setting('app.current_admin_id', TRUE) OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id::TEXT = current_setting('app.current_admin_id', TRUE)
      AND role = 'super_admin'
      AND is_active = TRUE
    )
  );

-- RLS для admin_settings (только суперадмины)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage settings"
  ON admin_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id::TEXT = current_setting('app.current_admin_id', TRUE)
      AND role = 'super_admin'
      AND is_active = TRUE
    )
  );

-- RLS для admin_notification_settings (каждый админ видит только свои настройки)
ALTER TABLE admin_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their own notification settings"
  ON admin_notification_settings FOR ALL
  USING (
    admin_id::TEXT = current_setting('app.current_admin_id', TRUE)
  );

-- RLS для admin_notifications (каждый админ видит только свои уведомления)
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own notifications"
  ON admin_notifications FOR SELECT
  USING (
    admin_id::TEXT = current_setting('app.current_admin_id', TRUE)
  );

CREATE POLICY "Admins can update their own notifications"
  ON admin_notifications FOR UPDATE
  USING (
    admin_id::TEXT = current_setting('app.current_admin_id', TRUE)
  );

-- RLS для admin_audit_log (только суперадмины могут просматривать)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit log"
  ON admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id::TEXT = current_setting('app.current_admin_id', TRUE)
      AND role = 'super_admin'
      AND is_active = TRUE
    )
  );

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Триггер для автоматического обновления updated_at в admin_settings
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Комментарии
COMMENT ON TABLE admin_users IS 'Администраторы платформы с разными ролями и правами доступа';
COMMENT ON TABLE admin_settings IS 'Настройки админ-панели (интеграции, API ключи и т.д.)';
COMMENT ON TABLE admin_notification_settings IS 'Настройки уведомлений для каждого админа';
COMMENT ON TABLE admin_notifications IS 'In-app уведомления для админов';
COMMENT ON TABLE admin_audit_log IS 'История действий админов для аудита безопасности';

-- ============================================
-- Создание первого суперадмина (выполнить вручную после миграции)
-- ============================================
-- INSERT INTO admin_users (email, password_hash, role, created_by)
-- VALUES (
--   'admin@bezpauzy.com',
--   '$2b$10$...', -- bcrypt hash пароля
--   'super_admin',
--   NULL -- Первый админ создается без created_by
-- );
-- ============================================
