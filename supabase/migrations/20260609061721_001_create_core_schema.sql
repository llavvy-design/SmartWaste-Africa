/*
# SmartWaste Africa Nexus - Core Database Schema

1. Overview
This migration establishes the complete enterprise data model for the SmartWaste Africa Nexus
platform - a multi-county AI-powered smart city waste management system for Kenya.

2. New Tables
- `counties`: All 47 Kenya counties with administrative data
- `cities`: Cities/sub-counties within each county
- `wards`: Wards (lowest administrative unit) within each city
- `smart_bins`: Individual bin infrastructure with telemetry, sensors, health
- `fleet_vehicles`: Municipal collection trucks with GPS, fuel, maintenance
- `drivers`: Fleet driver profiles
- `collection_routes`: Route definitions with stops and assignments
- `dispatch_queue`: Real-time priority-ranked dispatch jobs
- `citizen_reports`: Public complaints and service requests
- `contractors`: Waste collection contractors
- `telemetry_nodes`: Edge device telemetry data
- `incidents`: Environmental emergencies and hazards
- `sustainability_metrics`: Carbon, fuel, equity tracking
- `generated_reports`: AI-generated executive reports
- `agent_activity_logs`: Multi-agent system activity tracking
- `overflow_predictions`: AI-predicted overflow events
- `maintenance_schedules`: Predictive maintenance for bins/fleet

3. Security
- All tables use RLS with single-tenant policies (TO anon, authenticated)
- Data is shared across the platform (public municipal data)
*/

CREATE TABLE IF NOT EXISTS counties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  population integer DEFAULT 0,
  area_km2 numeric DEFAULT 0,
  capital_city text DEFAULT '',
  region text DEFAULT '',
  smart_bins_count integer DEFAULT 0,
  fleet_count integer DEFAULT 0,
  coverage_pct numeric DEFAULT 0,
  carbon_saved_tons numeric DEFAULT 0,
  fuel_saved_pct numeric DEFAULT 0,
  equity_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  population integer DEFAULT 0,
  smart_bins_count integer DEFAULT 0,
  fleet_count integer DEFAULT 0,
  coverage_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  population integer DEFAULT 0,
  smart_bins_count integer DEFAULT 0,
  coverage_pct numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smart_bins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id text NOT NULL UNIQUE,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  ward_id uuid REFERENCES wards(id) ON DELETE SET NULL,
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  address text DEFAULT '',
  fill_level_pct integer DEFAULT 0,
  temperature_c numeric DEFAULT 0,
  battery_pct integer DEFAULT 100,
  solar_charge_pct integer DEFAULT 0,
  odor_index integer DEFAULT 0,
  pest_detected boolean DEFAULT false,
  compactor_active boolean DEFAULT false,
  sensor_health text DEFAULT 'healthy',
  last_collection_at timestamptz,
  last_telemetry_at timestamptz,
  predicted_overflow_at timestamptz,
  status text DEFAULT 'active',
  guardian_override boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id text NOT NULL UNIQUE,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  driver_id uuid,
  vehicle_type text DEFAULT 'truck',
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  fuel_pct integer DEFAULT 100,
  emission_score numeric DEFAULT 0,
  route_id uuid,
  maintenance_health text DEFAULT 'healthy',
  remaining_capacity_kg integer DEFAULT 5000,
  status text DEFAULT 'available',
  eta_minutes integer DEFAULT 0,
  last_maintenance_at timestamptz,
  next_maintenance_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id text NOT NULL UNIQUE,
  name text NOT NULL,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  license_number text DEFAULT '',
  phone text DEFAULT '',
  rating numeric DEFAULT 5,
  trips_completed integer DEFAULT 0,
  hours_worked integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id text NOT NULL UNIQUE,
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  stops integer DEFAULT 0,
  distance_km numeric DEFAULT 0,
  estimated_time_minutes integer DEFAULT 0,
  status text DEFAULT 'pending',
  completion_pct integer DEFAULT 0,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS idx_smart_bins_county ON smart_bins(county_id);
CREATE INDEX IF NOT EXISTS idx_smart_bins_city ON smart_bins(city_id);
CREATE INDEX IF NOT EXISTS idx_fleet_county ON fleet_vehicles(county_id);
CREATE INDEX IF NOT EXISTS idx_fleet_status ON fleet_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_dispatch_county ON dispatch_queue(county_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_status ON dispatch_queue(status);
CREATE INDEX IF NOT EXISTS idx_reports_county ON citizen_reports(county_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_county ON telemetry_nodes(county_id);
CREATE INDEX IF NOT EXISTS idx_incidents_county ON incidents(county_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_county ON sustainability_metrics(county_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_activity_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_overflow_bin ON overflow_predictions(bin_id);
CREATE INDEX IF NOT EXISTS idx_routes_county ON collection_routes(county_id);

ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE overflow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_counties" ON counties;
CREATE POLICY "select_counties" ON counties FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_cities" ON cities;
CREATE POLICY "select_cities" ON cities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_wards" ON wards;
CREATE POLICY "select_wards" ON wards FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_smart_bins" ON smart_bins;
CREATE POLICY "select_smart_bins" ON smart_bins FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_fleet" ON fleet_vehicles;
CREATE POLICY "select_fleet" ON fleet_vehicles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_drivers" ON drivers;
CREATE POLICY "select_drivers" ON drivers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_routes" ON collection_routes;
CREATE POLICY "select_routes" ON collection_routes FOR SELECT TO anon, authenticated USING (true);

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
