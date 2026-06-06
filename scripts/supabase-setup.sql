-- AppDesk - Supabase Schema Setup (prefijo: appdesk_)
-- Ejecutar en el SQL Editor de Supabase

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS appdesk_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reporter' CHECK (role IN ('admin', 'reporter')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modules table
CREATE TABLE IF NOT EXISTS appdesk_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reports table
CREATE TABLE IF NOT EXISTS appdesk_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'task', 'feature')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'reopened')),
  description TEXT NOT NULL,
  module_id UUID REFERENCES appdesk_modules(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jira_ticket_id TEXT,
  jira_ticket_key TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_appdesk_reports_reporter_id ON appdesk_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_appdesk_reports_status ON appdesk_reports(status);
CREATE INDEX IF NOT EXISTS idx_appdesk_reports_type ON appdesk_reports(type);
CREATE INDEX IF NOT EXISTS idx_appdesk_reports_priority ON appdesk_reports(priority);
CREATE INDEX IF NOT EXISTS idx_appdesk_reports_module_id ON appdesk_reports(module_id);
CREATE INDEX IF NOT EXISTS idx_appdesk_reports_created_at ON appdesk_reports(created_at DESC);

-- 5. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION appdesk_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_appdesk_profiles_updated_at ON appdesk_profiles;
CREATE TRIGGER update_appdesk_profiles_updated_at
  BEFORE UPDATE ON appdesk_profiles
  FOR EACH ROW EXECUTE FUNCTION appdesk_update_updated_at();

DROP TRIGGER IF EXISTS update_appdesk_modules_updated_at ON appdesk_modules;
CREATE TRIGGER update_appdesk_modules_updated_at
  BEFORE UPDATE ON appdesk_modules
  FOR EACH ROW EXECUTE FUNCTION appdesk_update_updated_at();

DROP TRIGGER IF EXISTS update_appdesk_reports_updated_at ON appdesk_reports;
CREATE TRIGGER update_appdesk_reports_updated_at
  BEFORE UPDATE ON appdesk_reports
  FOR EACH ROW EXECUTE FUNCTION appdesk_update_updated_at();

-- 6. Row Level Security (RLS)
ALTER TABLE appdesk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appdesk_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appdesk_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON appdesk_profiles;
CREATE POLICY "Users can view own profile"
  ON appdesk_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON appdesk_profiles;
CREATE POLICY "Admins can view all profiles"
  ON appdesk_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert profiles" ON appdesk_profiles;
CREATE POLICY "Admins can insert profiles"
  ON appdesk_profiles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON appdesk_profiles;
CREATE POLICY "Users can update own profile"
  ON appdesk_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON appdesk_profiles;
CREATE POLICY "Admins can update any profile"
  ON appdesk_profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Modules policies
DROP POLICY IF EXISTS "Anyone can view modules" ON appdesk_modules;
CREATE POLICY "Anyone can view modules"
  ON appdesk_modules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert modules" ON appdesk_modules;
CREATE POLICY "Admins can insert modules"
  ON appdesk_modules FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update modules" ON appdesk_modules;
CREATE POLICY "Admins can update modules"
  ON appdesk_modules FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete modules" ON appdesk_modules;
CREATE POLICY "Admins can delete modules"
  ON appdesk_modules FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reports policies
DROP POLICY IF EXISTS "Users can view own reports" ON appdesk_reports;
CREATE POLICY "Users can view own reports"
  ON appdesk_reports FOR SELECT
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all reports" ON appdesk_reports;
CREATE POLICY "Admins can view all reports"
  ON appdesk_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert reports" ON appdesk_reports;
CREATE POLICY "Users can insert reports"
  ON appdesk_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own reports" ON appdesk_reports;
CREATE POLICY "Users can update own reports"
  ON appdesk_reports FOR UPDATE
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any report" ON appdesk_reports;
CREATE POLICY "Admins can update any report"
  ON appdesk_reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can delete own reports" ON appdesk_reports;
CREATE POLICY "Users can delete own reports"
  ON appdesk_reports FOR DELETE
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete any report" ON appdesk_reports;
CREATE POLICY "Admins can delete any report"
  ON appdesk_reports FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM appdesk_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('appdesk-attachments', 'appdesk-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'appdesk-attachments' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;
CREATE POLICY "Anyone can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'appdesk-attachments');

-- 8. Auto-create profile on signup (respects role from metadata)
CREATE OR REPLACE FUNCTION appdesk_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.appdesk_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'reporter')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_appdesk_auth_user_created ON auth.users;
CREATE TRIGGER on_appdesk_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION appdesk_handle_new_user();

-- 9. Seed data: default modules
INSERT INTO appdesk_modules (name, description) VALUES
  ('Autenticación', 'Login, registro y gestión de sesiones'),
  ('Dashboard', 'Panel principal y visualizaciones'),
  ('Reportes', 'Sistema de reportes y tickets'),
  ('Administración', 'Panel de administración y configuraciones'),
  ('API', 'API y servicios externos'),
  ('Base de Datos', 'Consultas, migraciones y datos'),
  ('UI/UX', 'Interfaz de usuario y experiencia'),
  ('Seguridad', 'Seguridad y permisos'),
  ('Rendimiento', 'Performance y optimización'),
  ('Otro', 'Otros módulos no categorizados')
ON CONFLICT (name) DO NOTHING;
