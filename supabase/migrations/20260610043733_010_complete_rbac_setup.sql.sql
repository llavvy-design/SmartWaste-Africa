/*
# Complete RBAC Demo Accounts Setup

Creates all 6 demo user accounts with proper roles.
Password for all: Demo@2024
*/

-- First, ensure the demo_users table exists
CREATE TABLE IF NOT EXISTS demo_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL,
  full_name text NOT NULL,
  county_id uuid REFERENCES counties(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert demo user credentials for reference
INSERT INTO demo_users (email, password, role, full_name, county_id) VALUES
  ('citizen@smartwaste.africa', 'Demo@2024', 'citizen', 'Jane Wanjiku', (SELECT id FROM counties WHERE code = '047')),
  ('contractor@smartwaste.africa', 'Demo@2024', 'contractor', 'Peter Ochieng', (SELECT id FROM counties WHERE code = '047')),
  ('dispatcher@smartwaste.africa', 'Demo@2024', 'dispatcher', 'Mary Njeri', (SELECT id FROM counties WHERE code = '047')),
  ('admin@smartwaste.africa', 'Demo@2024', 'municipal_admin', 'John Mutua', (SELECT id FROM counties WHERE code = '047')),
  ('executive@smartwaste.africa', 'Demo@2024', 'executive', 'Dr. Sarah Kipchoge', (SELECT id FROM counties WHERE code = '047')),
  ('superadmin@smartwaste.africa', 'Demo@2024', 'super_admin', 'System Administrator', (SELECT id FROM counties WHERE code = '047'))
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  county_id = EXCLUDED.county_id;

-- Update existing contractor profile if needed
UPDATE profiles SET
  role = 'contractor',
  account_status = 'active',
  full_name = 'Peter Ochieng (Demo Contractor)'
WHERE email = 'contractor@smartwaste.africa';

-- Ensure permission templates are complete
INSERT INTO permission_templates (role_name, description, permissions) VALUES
  ('citizen', 'Community reporting and engagement capabilities', 
   '["citizen_portal", "submit_reports", "view_own_reports", "request_pickup", "upload_images", "view_recycling_education", "receive_notifications", "update_own_profile"]'),
  ('contractor', 'Waste collection execution capabilities',
   '["contractor_portal", "view_assigned_routes", "view_assigned_incidents", "update_route_progress", "upload_completion_photos", "upload_proof_of_collection", "view_performance_metrics", "receive_notifications", "update_own_profile"]'),
  ('dispatcher', 'Operational coordination capabilities',
   '["dispatcher_portal", "view_all_incidents", "manage_dispatch_queue", "assign_routes", "assign_contractors", "monitor_fleet_activity", "view_telemetry", "receive_alerts", "fleet", "bins", "incidents", "update_own_profile"]'),
  ('municipal_admin', 'County-level management capabilities',
   '["municipal_admin_portal", "manage_users", "manage_contractors", "review_reports", "review_incidents", "view_county_analytics", "manage_smart_bins", "manage_fleet_assets", "user_management", "bins", "fleet", "incidents", "audit_trail", "reports", "dashboard", "gis", "telemetry", "agents", "update_own_profile"]'),
  ('executive', 'Strategic oversight capabilities',
   '["executive_portal", "view_reports", "view_sustainability_metrics", "view_esg_metrics", "view_county_performance", "view_financial_insights", "digital_twin", "sustainability", "analytics", "update_own_profile"]'),
  ('super_admin', 'Full platform governance capabilities',
   '["all", "super_admin_portal", "manage_users", "manage_roles", "manage_permissions", "security_center", "system_settings", "audit_trail", "all_portals"]')
ON CONFLICT (role_name) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  description = EXCLUDED.description;

-- Add role-specific dashboard routes to app_settings
INSERT INTO app_settings (key, value, description) VALUES
  ('role_dashboard_routes', '{
    "citizen": "/citizen",
    "contractor": "/contractor",
    "dispatcher": "/dispatcher",
    "municipal_admin": "/admin",
    "executive": "/executive",
    "super_admin": "/superadmin"
  }', 'Default dashboard routes for each role')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Ensure notifications exist for each role type
INSERT INTO notifications (user_id, title, body, type, action_url, metadata)
SELECT 
  p.id,
  'Welcome to SmartWaste Africa Nexus',
  'Your ' || p.role || ' account has been activated. Explore the platform features available to your role.',
  'success',
  CASE p.role
    WHEN 'citizen' THEN '/citizen'
    WHEN 'contractor' THEN '/contractor'
    WHEN 'dispatcher' THEN '/dispatcher'
    WHEN 'municipal_admin' THEN '/admin'
    WHEN 'executive' THEN '/executive'
    WHEN 'super_admin' THEN '/superadmin'
    ELSE '/dashboard'
  END,
  jsonb_build_object('demo', true, 'role', p.role)
FROM profiles p
WHERE p.email LIKE '%@smartwaste.africa'
ON CONFLICT DO NOTHING;
