/*
# Location Hierarchy Expansion

Expands the geographic hierarchy to include subcounties, wards, and towns
for dynamic cascading dropdowns with Kenya's full administrative structure.
*/

CREATE TABLE IF NOT EXISTS subcounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text DEFAULT '',
  population integer DEFAULT 0,
  smart_bins_count integer DEFAULT 0,
  fleet_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS towns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id uuid NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  subcounty_id uuid REFERENCES subcounties(id) ON DELETE SET NULL,
  ward_id uuid REFERENCES wards(id) ON DELETE SET NULL,
  name text NOT NULL,
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  population integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subcounties_county ON subcounties(county_id);
CREATE INDEX IF NOT EXISTS idx_towns_county ON towns(county_id);
CREATE INDEX IF NOT EXISTS idx_towns_subcounty ON towns(subcounty_id);

ALTER TABLE subcounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE towns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_subcounties" ON subcounties;
CREATE POLICY "select_subcounties" ON subcounties FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_towns" ON towns;
CREATE POLICY "select_towns" ON towns FOR SELECT TO anon, authenticated USING (true);

-- Add location columns to smart_bins
ALTER TABLE smart_bins ADD COLUMN IF NOT EXISTS subcounty_id uuid REFERENCES subcounties(id) ON DELETE SET NULL;
ALTER TABLE smart_bins ADD COLUMN IF NOT EXISTS town_id uuid REFERENCES towns(id) ON DELETE SET NULL;
ALTER TABLE smart_bins ADD COLUMN IF NOT EXISTS town text DEFAULT '';
ALTER TABLE smart_bins ADD COLUMN IF NOT EXISTS subcounty text DEFAULT '';

-- Add location columns to citizen_reports
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS subcounty_id uuid REFERENCES subcounties(id) ON DELETE SET NULL;
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS subcounty text DEFAULT '';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS town text DEFAULT '';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS village text DEFAULT '';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS ticket_id text DEFAULT '';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS ai_analysis text DEFAULT '';
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS guardian_equity_score numeric DEFAULT 0;
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS dispatch_priority integer DEFAULT 0;
ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS assigned_vehicle_id uuid REFERENCES fleet_vehicles(id) ON DELETE SET NULL;

-- Add image and proof columns to incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS ticket_id text DEFAULT '';

-- Add completion proof to fleet_vehicles
ALTER TABLE fleet_vehicles ADD COLUMN IF NOT EXISTS current_route_id uuid REFERENCES collection_routes(id) ON DELETE SET NULL;
ALTER TABLE fleet_vehicles ADD COLUMN IF NOT EXISTS contractor_id uuid REFERENCES contractors(id) ON DELETE SET NULL;
ALTER TABLE fleet_vehicles ADD COLUMN IF NOT EXISTS assigned_contractor text DEFAULT '';

-- Add completion proof to collection_routes
ALTER TABLE collection_routes ADD COLUMN IF NOT EXISTS completion_images text[] DEFAULT '{}';
ALTER TABLE collection_routes ADD COLUMN IF NOT EXISTS completion_notes text DEFAULT '';
ALTER TABLE collection_routes ADD COLUMN IF NOT EXISTS completion_gps_lat numeric DEFAULT 0;
ALTER TABLE collection_routes ADD COLUMN IF NOT EXISTS completion_gps_lng numeric DEFAULT 0;
ALTER TABLE collection_routes ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE collection_routes ADD COLUMN IF NOT EXISTS contractor_id uuid REFERENCES contractors(id) ON DELETE SET NULL;

-- Create incident_category table
CREATE TABLE IF NOT EXISTS incident_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text DEFAULT '',
  default_severity text DEFAULT 'medium',
  auto_escalate boolean DEFAULT false,
  requires_image boolean DEFAULT false,
  guardian_equity_check boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incident_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_incident_categories" ON incident_categories;
CREATE POLICY "select_incident_categories" ON incident_categories FOR SELECT TO anon, authenticated USING (true);

INSERT INTO incident_categories (name, label, description, default_severity, auto_escalate, requires_image, guardian_equity_check) VALUES
  ('overflow', 'Overflowing Bin', 'Bin capacity exceeded 80% threshold', 'medium', false, true, true),
  ('pickup', 'Pickup Request', 'Scheduled or emergency pickup request', 'low', false, false, false),
  ('illegal_dumping', 'Illegal Dumping', 'Unauthorized waste disposal', 'high', true, true, true),
  ('hazardous', 'Hazardous Waste', 'Dangerous or toxic materials', 'critical', true, true, true),
  ('fire', 'Fire Risk', 'Combustible material or fire hazard', 'critical', true, true, true),
  ('flood', 'Flood Debris', 'Post-flood waste accumulation', 'high', false, true, true),
  ('maintenance', 'Maintenance Request', 'Bin damage or equipment failure', 'medium', false, true, false),
  ('other', 'Other Issue', 'Miscellaneous report', 'low', false, false, false)
ON CONFLICT (name) DO NOTHING;

-- Seed subcounties for major counties
INSERT INTO subcounties (county_id, name, code, population, smart_bins_count, fleet_count) VALUES
  ((SELECT id FROM counties WHERE code = '047'), 'Dagoretti', '047A', 320000, 180, 15),
  ((SELECT id FROM counties WHERE code = '047'), 'Embakasi', '047B', 450000, 220, 18),
  ((SELECT id FROM counties WHERE code = '047'), 'Kamukunji', '047C', 280000, 160, 12),
  ((SELECT id FROM counties WHERE code = '047'), 'Kasarani', '047D', 350000, 190, 16),
  ((SELECT id FROM counties WHERE code = '047'), 'Kibra', '047E', 200000, 120, 10),
  ((SELECT id FROM counties WHERE code = '047'), 'Langata', '047F', 150000, 85, 8),
  ((SELECT id FROM counties WHERE code = '047'), 'Makadara', '047G', 180000, 105, 9),
  ((SELECT id FROM counties WHERE code = '047'), 'Mathare', '047H', 250000, 140, 11),
  ((SELECT id FROM counties WHERE code = '047'), 'Starehe', '047I', 190000, 110, 9),
  ((SELECT id FROM counties WHERE code = '047'), 'Westlands', '047J', 220000, 130, 14)
ON CONFLICT DO NOTHING;

INSERT INTO subcounties (county_id, name, code, population, smart_bins_count, fleet_count) VALUES
  ((SELECT id FROM counties WHERE code = '001'), 'Changamwe', '001A', 120000, 45, 4),
  ((SELECT id FROM counties WHERE code = '001'), 'Jomvu', '001B', 90000, 35, 3),
  ((SELECT id FROM counties WHERE code = '001'), 'Kisauni', '001C', 180000, 55, 5),
  ((SELECT id FROM counties WHERE code = '001'), 'Likoni', '001D', 110000, 40, 3),
  ((SELECT id FROM counties WHERE code = '001'), 'Mvita', '001E', 130000, 50, 4),
  ((SELECT id FROM counties WHERE code = '001'), 'Nyali', '001F', 95000, 38, 3)
ON CONFLICT DO NOTHING;

INSERT INTO subcounties (county_id, name, code, population, smart_bins_count, fleet_count) VALUES
  ((SELECT id FROM counties WHERE code = '042'), 'Kisumu Central', '042A', 160000, 85, 7),
  ((SELECT id FROM counties WHERE code = '042'), 'Kisumu East', '042B', 85000, 45, 4),
  ((SELECT id FROM counties WHERE code = '042'), 'Kisumu West', '042C', 70000, 35, 3),
  ((SELECT id FROM counties WHERE code = '042'), 'Muhoroni', '042D', 65000, 40, 3),
  ((SELECT id FROM counties WHERE code = '042'), 'Nyando', '042E', 70000, 38, 3),
  ((SELECT id FROM counties WHERE code = '042'), 'Seme', '042F', 60000, 32, 3)
ON CONFLICT DO NOTHING;

-- Seed wards for Nairobi subcounties
INSERT INTO wards (city_id, name, population, smart_bins_count, coverage_pct) VALUES
  ((SELECT id FROM cities WHERE name = 'Nairobi CBD'), 'Ngara', 45000, 35, 94),
  ((SELECT id FROM cities WHERE name = 'Nairobi CBD'), 'Pangani', 38000, 28, 92),
  ((SELECT id FROM cities WHERE name = 'Nairobi CBD'), 'Kariokor', 32000, 22, 89),
  ((SELECT id FROM cities WHERE name = 'Westlands'), 'Parklands', 55000, 42, 96),
  ((SELECT id FROM cities WHERE name = 'Westlands'), 'Highridge', 48000, 38, 95),
  ((SELECT id FROM cities WHERE name = 'Westlands'), 'Mountain View', 42000, 35, 94),
  ((SELECT id FROM cities WHERE name = 'Kibera'), 'Sarangombe', 52000, 30, 87),
  ((SELECT id FROM cities WHERE name = 'Kibera'), 'Makina', 48000, 28, 86),
  ((SELECT id FROM cities WHERE name = 'Kibera'), 'Laini Saba', 45000, 26, 85),
  ((SELECT id FROM cities WHERE name = 'Eastleigh'), 'Eastleigh North', 60000, 45, 93),
  ((SELECT id FROM cities WHERE name = 'Eastleigh'), 'Eastleigh South', 55000, 42, 92)
ON CONFLICT DO NOTHING;

-- Seed towns for Nairobi subcounties
INSERT INTO towns (county_id, subcounty_id, name, latitude, longitude, population) VALUES
  ((SELECT id FROM counties WHERE code = '047'), (SELECT id FROM subcounties WHERE name = 'Dagoretti'), 'Kawangware', -1.295, 36.740, 120000),
  ((SELECT id FROM counties WHERE code = '047'), (SELECT id FROM subcounties WHERE name = 'Dagoretti'), 'Riruta', -1.285, 36.725, 85000),
  ((SELECT id FROM counties WHERE code = '047'), (SELECT id FROM subcounties WHERE name = 'Embakasi'), 'Umoja', -1.275, 36.885, 150000),
  ((SELECT id FROM counties WHERE code = '047'), (SELECT id FROM subcounties WHERE name = 'Embakasi'), 'Kayole', -1.265, 36.905, 180000),
  ((SELECT id FROM counties WHERE code = '047'), (SELECT id FROM subcounties WHERE name = 'Kibra'), 'Kibera', -1.310, 36.785, 250000),
  ((SELECT id FROM counties WHERE code = '047'), (SELECT id FROM subcounties WHERE name = 'Langata'), 'Karen', -1.335, 36.720, 80000)
ON CONFLICT DO NOTHING;
