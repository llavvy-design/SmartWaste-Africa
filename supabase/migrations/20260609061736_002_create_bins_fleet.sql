/*
# SmartWaste Africa Nexus - Bins, Fleet, Drivers, Routes

Creates core operational tables for smart bins, fleet vehicles, drivers,
and collection routes with full geographic references.
*/

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

CREATE INDEX IF NOT EXISTS idx_smart_bins_county ON smart_bins(county_id);
CREATE INDEX IF NOT EXISTS idx_smart_bins_city ON smart_bins(city_id);
CREATE INDEX IF NOT EXISTS idx_fleet_county ON fleet_vehicles(county_id);
CREATE INDEX IF NOT EXISTS idx_fleet_status ON fleet_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_routes_county ON collection_routes(county_id);

ALTER TABLE smart_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_smart_bins" ON smart_bins;
CREATE POLICY "select_smart_bins" ON smart_bins FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_fleet" ON fleet_vehicles;
CREATE POLICY "select_fleet" ON fleet_vehicles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_drivers" ON drivers;
CREATE POLICY "select_drivers" ON drivers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_routes" ON collection_routes;
CREATE POLICY "select_routes" ON collection_routes FOR SELECT TO anon, authenticated USING (true);
