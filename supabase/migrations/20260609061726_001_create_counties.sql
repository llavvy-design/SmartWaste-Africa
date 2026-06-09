/*
# SmartWaste Africa Nexus - Counties and Cities Schema

Creates tables for all 47 Kenya counties and their sub-cities.
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

ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_counties" ON counties;
CREATE POLICY "select_counties" ON counties FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_cities" ON cities;
CREATE POLICY "select_cities" ON cities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "select_wards" ON wards;
CREATE POLICY "select_wards" ON wards FOR SELECT TO anon, authenticated USING (true);
