export interface County {
  id: string;
  code: string;
  name: string;
  population: number;
  area_km2: number;
  capital_city: string;
  region: string;
  smart_bins_count: number;
  fleet_count: number;
  coverage_pct: number;
  carbon_saved_tons: number;
  fuel_saved_pct: number;
  equity_score: number;
}

export interface City {
  id: string;
  county_id: string;
  name: string;
  latitude: number;
  longitude: number;
  population: number;
  smart_bins_count: number;
  fleet_count: number;
  coverage_pct: number;
}

export interface Ward {
  id: string;
  city_id: string;
  name: string;
  population: number;
  smart_bins_count: number;
  coverage_pct: number;
}

export interface Subcounty {
  id: string;
  county_id: string;
  name: string;
  code: string;
  population: number;
  smart_bins_count: number;
  fleet_count: number;
}

export interface Town {
  id: string;
  county_id: string;
  subcounty_id: string | null;
  ward_id: string | null;
  name: string;
  latitude: number;
  longitude: number;
  population: number;
}

export interface SmartBin {
  id: string;
  bin_id: string;
  county_id: string;
  city_id: string;
  ward_id?: string;
  latitude: number;
  longitude: number;
  address: string;
  fill_level_pct: number;
  temperature_c: number;
  battery_pct: number;
  solar_charge_pct: number;
  odor_index: number;
  pest_detected: boolean;
  compactor_active: boolean;
  sensor_health: string;
  last_collection_at: string | null;
  last_telemetry_at: string | null;
  predicted_overflow_at: string | null;
  status: string;
  guardian_override: boolean;
  subcounty_id?: string;
  town_id?: string;
  town?: string;
  subcounty?: string;
}

export interface FleetVehicle {
  id: string;
  fleet_id: string;
  county_id: string;
  city_id?: string;
  driver_id?: string;
  vehicle_type: string;
  latitude: number;
  longitude: number;
  fuel_pct: number;
  emission_score: number;
  route_id?: string;
  maintenance_health: string;
  remaining_capacity_kg: number;
  status: string;
  eta_minutes: number;
  last_maintenance_at: string | null;
  next_maintenance_at: string | null;
  current_route_id?: string;
  contractor_id?: string;
  assigned_contractor?: string;
}

export interface Driver {
  id: string;
  driver_id: string;
  name: string;
  county_id: string;
  city_id?: string;
  license_number: string;
  phone: string;
  rating: number;
  trips_completed: number;
  hours_worked: number;
  status: string;
}

export interface CitizenReport {
  id: string;
  county_id: string;
  city_id: string;
  ward_id?: string;
  reporter_name: string;
  phone: string;
  report_type: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  status: string;
  priority: string;
  assigned_to?: string;
  resolved_at: string | null;
  created_at: string;
  subcounty_id?: string;
  subcounty?: string;
  town?: string;
  village?: string;
  ticket_id?: string;
  severity?: string;
  images?: string[];
  ai_analysis?: string;
  guardian_equity_score?: number;
  dispatch_priority?: number;
  assigned_vehicle_id?: string;
}

export interface TelemetryNode {
  id: string;
  device_id: string;
  county_id: string;
  city_id: string;
  bin_id?: string;
  latitude: number;
  longitude: number;
  battery_pct: number;
  signal_strength: number;
  last_sync_at: string | null;
  cpu_usage_pct: number;
  payload_integrity: string;
  edge_latency_ms: number;
  throughput_kbps: number;
  status: string;
}

export interface Incident {
  id: string;
  county_id: string;
  city_id: string;
  incident_type: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  assigned_to?: string;
  status: string;
  escalated: boolean;
  resolved_at: string | null;
  created_at: string;
  images?: string[];
  reported_by?: string;
  ticket_id?: string;
}

export interface Contractor {
  id: string;
  contractor_id: string;
  name: string;
  county_id: string;
  license_number: string;
  compliance_score: number;
  routes_completed: number;
  on_time_pct: number;
  active_fleet_count: number;
  status: string;
}

export interface DispatchJob {
  id: string;
  county_id: string;
  city_id: string;
  bin_id?: string;
  priority: number;
  fill_level_pct: number;
  wait_time_minutes: number;
  assigned_vehicle_id?: string;
  assigned_driver_id?: string;
  is_guardian_override: boolean;
  is_citizen_report: boolean;
  status: string;
  created_at: string;
}

export interface SustainabilityMetric {
  id: string;
  county_id: string;
  city_id: string;
  month: string;
  year: number;
  carbon_prevented_tons: number;
  fuel_saved_liters: number;
  fuel_efficiency_pct: number;
  collection_efficiency_pct: number;
  equity_score: number;
  recycling_rate_pct: number;
  service_coverage_pct: number;
  trucks_dispatched: number;
  bins_collected: number;
}

export interface AgentLog {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  mission: string;
  confidence_pct: number;
  health_pct: number;
  tasks_completed: number;
  resource_consumption_pct: number;
  status: string;
  log_message: string;
  log_level: string;
  created_at: string;
}

export interface OverflowPrediction {
  id: string;
  bin_id: string;
  county_id: string;
  city_id: string;
  current_fill_pct: number;
  predicted_80_at: string | null;
  predicted_90_at: string | null;
  predicted_100_at: string | null;
  confidence_pct: number;
  model_version: string;
}

export interface MaintenanceSchedule {
  id: string;
  asset_type: string;
  asset_id: string;
  county_id: string;
  city_id: string;
  maintenance_type: string;
  description: string;
  predicted_failure_at: string | null;
  recommended_action: string;
  priority: string;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
}

export interface GeneratedReport {
  id: string;
  county_id: string;
  city_id?: string;
  report_type: string;
  date_range: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  download_url: string;
  status: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  action_url: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  county_id: string | null;
  city_id: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string;
  updated_at: string;
}
