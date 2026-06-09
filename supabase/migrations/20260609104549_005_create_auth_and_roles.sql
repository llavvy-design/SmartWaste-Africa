/*
# Authentication and Role-Based Access Control Schema

1. Overview
This migration establishes the complete authentication, authorization, and role-based access control system for the SmartWaste Africa Nexus platform.

2. New Tables
- `profiles`: Extended user profiles linked to auth.users
- `roles`: System role definitions (citizen, contractor, dispatcher, municipal_admin, executive, super_admin)
- `user_roles`: Many-to-many mapping between users and roles
- `audit_logs`: Immutable action trail for all user actions
- `notifications`: Real-time notification system
- `app_settings`: Platform-wide operational configuration

3. Security
- RLS policies enforce role-based access
- All tables are owner-scoped where needed
- App-level data uses anon policies for demo / single-tenant mode
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  county_id uuid REFERENCES counties(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  role text DEFAULT 'citizen',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text DEFAULT '',
  permissions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text DEFAULT '',
  entity_id text DEFAULT '',
  details jsonb DEFAULT '{}',
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  action_url text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb DEFAULT '{}',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "anon_insert_profile" ON profiles;
CREATE POLICY "anon_insert_profile" ON profiles FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_roles" ON roles;
CREATE POLICY "select_roles" ON roles FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_user_roles" ON user_roles;
CREATE POLICY "select_user_roles" ON user_roles FOR SELECT
TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "select_audit_logs" ON audit_logs;
CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_app_settings" ON app_settings;
CREATE POLICY "select_app_settings" ON app_settings FOR SELECT
TO anon, authenticated USING (true);

-- Insert default roles
INSERT INTO roles (name, label, description, permissions) VALUES
  ('citizen', 'Citizen', 'Can submit reports, track status, request pickups', '["citizen_portal","submit_reports","view_own_reports","request_pickup"]'),
  ('contractor', 'Contractor', 'Can view assigned routes, update status, complete pickups', '["contractor_portal","view_routes","update_route_status","upload_service_proof"]'),
  ('dispatcher', 'Dispatcher', 'Can view incidents, assign routes, manage dispatch queue', '["dashboard","incidents","dispatch_queue","telemetry","fleet"]'),
  ('municipal_admin', 'Municipal Administrator', 'Can view county analytics, manage contractors, assets, reports', '["dashboard","bins","fleet","contractors","citizen_reports","analytics","reports"]'),
  ('executive', 'Executive', 'Can view sustainability metrics, county performance, generate reports', '["executive_portal","sustainability","digital_twin","reports","analytics"]'),
  ('super_admin', 'Super Admin', 'Full platform control', '["all"]')
ON CONFLICT (name) DO NOTHING;
