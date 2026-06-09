/*
# SmartWaste Africa Nexus - Dispatch, Reports, Contractors, Telemetry

Creates operational tables for dispatch queue, citizen reports, contractors,
and telemetry nodes.
*/

CREATE TABLE IF NOT EXISTS dispatch_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  bin_id uuid REFERENCES smart_bins(id) ON DELETE SET NULL,
  priority integer DEFAULT 0,
  fill_level_pct integer DEFAULT 0,
  wait_time_minutes integer DEFAULT 0,
  assigned_vehicle_id uuid REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
  assigned_driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  is_guardian_override boolean DEFAULT false,
  is_citizen_report boolean DEFAULT false,
  status text DEFAULT 'queued',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizen_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  ward_id uuid REFERENCES wards(id) ON DELETE SET NULL,
  reporter_name text DEFAULT '',
  phone text DEFAULT '',
  report_type text DEFAULT 'overflow',
  description text DEFAULT '',
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  photo_url text DEFAULT '',
  status text DEFAULT 'submitted',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES drivers(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id text NOT NULL UNIQUE,
  name text NOT NULL,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  license_number text DEFAULT '',
  compliance_score numeric DEFAULT 0,
  routes_completed integer DEFAULT 0,
  on_time_pct numeric DEFAULT 0,
  active_fleet_count integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemetry_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  bin_id uuid REFERENCES smart_bins(id) ON DELETE SET NULL,
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  battery_pct integer DEFAULT 100,
  signal_strength integer DEFAULT -70,
  last_sync_at timestamptz,
  cpu_usage_pct integer DEFAULT 0,
  payload_integrity text DEFAULT 'intact',
  edge_latency_ms integer DEFAULT 0,
  throughput_kbps integer DEFAULT 0,
  status text DEFAULT 'online',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_county ON dispatch_queue(county_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_status ON dispatch_queue(status);
CREATE INDEX IF NOT EXISTS idx_reports_county ON citizen_reports(county_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_county ON telemetry_nodes(county_id);

ALTER TABLE dispatch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_dispatch" ON dispatch_queue;
CREATE POLICY "select_dispatch" ON dispatch_queue FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_reports" ON citizen_reports;
CREATE POLICY "select_reports" ON citizen_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_reports" ON citizen_reports;
CREATE POLICY "insert_reports" ON citizen_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "select_contractors" ON contractors;
CREATE POLICY "select_contractors" ON contractors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_telemetry" ON telemetry_nodes;
CREATE POLICY "select_telemetry" ON telemetry_nodes FOR SELECT TO anon, authenticated USING (true);
