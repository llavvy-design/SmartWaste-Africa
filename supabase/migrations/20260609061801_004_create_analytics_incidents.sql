/*
# SmartWaste Africa Nexus - Incidents, Sustainability, Reports

Creates analytics and incident tracking tables.
*/

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  incident_type text DEFAULT 'overflow',
  severity text DEFAULT 'low',
  description text DEFAULT '',
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  assigned_to uuid REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
  status text DEFAULT 'open',
  escalated boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sustainability_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  month text NOT NULL,
  year integer DEFAULT 2024,
  carbon_prevented_tons numeric DEFAULT 0,
  fuel_saved_liters numeric DEFAULT 0,
  fuel_efficiency_pct numeric DEFAULT 0,
  collection_efficiency_pct numeric DEFAULT 0,
  equity_score numeric DEFAULT 0,
  recycling_rate_pct numeric DEFAULT 0,
  service_coverage_pct numeric DEFAULT 0,
  trucks_dispatched integer DEFAULT 0,
  bins_collected integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  report_type text DEFAULT 'executive',
  date_range text DEFAULT '',
  title text DEFAULT '',
  content text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  download_url text DEFAULT '',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_type text NOT NULL,
  mission text DEFAULT '',
  confidence_pct integer DEFAULT 0,
  health_pct integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  resource_consumption_pct integer DEFAULT 0,
  status text DEFAULT 'online',
  log_message text DEFAULT '',
  log_level text DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS overflow_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id uuid NOT NULL REFERENCES smart_bins(id) ON DELETE CASCADE,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  current_fill_pct integer DEFAULT 0,
  predicted_80_at timestamptz,
  predicted_90_at timestamptz,
  predicted_100_at timestamptz,
  confidence_pct integer DEFAULT 0,
  model_version text DEFAULT 'v1',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL,
  asset_id text NOT NULL,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  maintenance_type text DEFAULT 'routine',
  description text DEFAULT '',
  predicted_failure_at timestamptz,
  recommended_action text DEFAULT '',
  priority text DEFAULT 'medium',
  status text DEFAULT 'scheduled',
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_county ON incidents(county_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_county ON sustainability_metrics(county_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_activity_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_overflow_bin ON overflow_predictions(bin_id);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE overflow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_incidents" ON incidents;
CREATE POLICY "select_incidents" ON incidents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_sustainability" ON sustainability_metrics;
CREATE POLICY "select_sustainability" ON sustainability_metrics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_generated_reports" ON generated_reports;
CREATE POLICY "select_generated_reports" ON generated_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_generated_reports" ON generated_reports;
CREATE POLICY "insert_generated_reports" ON generated_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "select_agent_logs" ON agent_activity_logs;
CREATE POLICY "select_agent_logs" ON agent_activity_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_overflow_predictions" ON overflow_predictions;
CREATE POLICY "select_overflow_predictions" ON overflow_predictions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_maintenance_schedules" ON maintenance_schedules;
CREATE POLICY "select_maintenance_schedules" ON maintenance_schedules FOR SELECT TO anon, authenticated USING (true);
