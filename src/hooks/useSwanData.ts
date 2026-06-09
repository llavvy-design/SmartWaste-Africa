import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  County, City, Ward, SmartBin, FleetVehicle, Driver, CitizenReport,
  TelemetryNode, Incident, Contractor, DispatchJob, SustainabilityMetric,
  AgentLog, OverflowPrediction, MaintenanceSchedule, GeneratedReport,
  Subcounty, Town, AuditLog, Notification, AppSetting, Profile
} from '../types';

export function useCounties() {
  const [data, setData] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .order('name');
      if (error) setError(error.message);
      else setData(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { data, loading, error };
}

export function useCities(countyId?: string) {
  const [data, setData] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('cities').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q.order('name');
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useSmartBins(countyId?: string, cityId?: string) {
  const [data, setData] = useState<SmartBin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('smart_bins').select('*');
    if (countyId) q = q.eq('county_id', countyId);
    if (cityId) q = q.eq('city_id', cityId);
    const { data } = await q.order('fill_level_pct', { ascending: false });
    setData(data || []);
    setLoading(false);
  }, [countyId, cityId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useFleetVehicles(countyId?: string) {
  const [data, setData] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('fleet_vehicles').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useDrivers(countyId?: string) {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('drivers').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useCitizenReports(countyId?: string) {
  const [data, setData] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('citizen_reports').select('*').order('created_at', { ascending: false });
    if (countyId) q = q.eq('county_id', countyId);
    const { data } = await q;
    setData(data || []);
    setLoading(false);
  }, [countyId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTelemetryNodes(countyId?: string) {
  const [data, setData] = useState<TelemetryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('telemetry_nodes').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useIncidents(countyId?: string) {
  const [data, setData] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (countyId) q = q.eq('county_id', countyId);
    const { data } = await q;
    setData(data || []);
    setLoading(false);
  }, [countyId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useContractors(countyId?: string) {
  const [data, setData] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('contractors').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useDispatchQueue(countyId?: string) {
  const [data, setData] = useState<DispatchJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('dispatch_queue').select('*').order('priority', { ascending: true });
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useSustainabilityMetrics(countyId?: string) {
  const [data, setData] = useState<SustainabilityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('sustainability_metrics').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useAgentLogs(agentId?: string, limit = 50) {
  const [data, setData] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('agent_activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
      if (agentId) q = q.eq('agent_id', agentId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [agentId, limit]);

  return { data, loading };
}

export function useOverflowPredictions(countyId?: string) {
  const [data, setData] = useState<OverflowPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('overflow_predictions').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useMaintenanceSchedules(countyId?: string) {
  const [data, setData] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('maintenance_schedules').select('*').order('scheduled_at', { ascending: false });
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useGeneratedReports(countyId?: string) {
  const [data, setData] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase.from('generated_reports').select('*').order('created_at', { ascending: false });
    if (countyId) q = q.eq('county_id', countyId);
    const { data } = await q;
    setData(data || []);
    setLoading(false);
  }, [countyId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useWards(cityId?: string) {
  const [data, setData] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('wards').select('*');
      if (cityId) q = q.eq('city_id', cityId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [cityId]);

  return { data, loading };
}

export function useSubcounties(countyId?: string) {
  const [data, setData] = useState<Subcounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('subcounties').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId]);

  return { data, loading };
}

export function useTowns(countyId?: string, subcountyId?: string) {
  const [data, setData] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let q = supabase.from('towns').select('*');
      if (countyId) q = q.eq('county_id', countyId);
      if (subcountyId) q = q.eq('subcounty_id', subcountyId);
      const { data } = await q;
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [countyId, subcountyId]);

  return { data, loading };
}

export function useAuditLogs(limit = 50) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, [limit]);

  return { data, loading };
}

export function useNotifications(userId?: string, limit = 50) {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let q = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (userId) q = q.eq('user_id', userId);
    const { data } = await q;
    setData(data || []);
    setLoading(false);
  }, [userId, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useAppSettings() {
  const [data, setData] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('app_settings').select('*');
      setData(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { data, loading };
}

export function useProfile(userId?: string) {
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!userId) {
        setData(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setData(data || null);
      setLoading(false);
    }
    fetch();
  }, [userId]);

  return { data, loading };
}

export function useAggregateStats() {
  const [stats, setStats] = useState({
    totalCounties: 0,
    totalBins: 0,
    totalFleet: 0,
    totalReports: 0,
    totalCarbon: 0,
    avgCoverage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data: counties } = await supabase.from('counties').select('*');
      const { data: bins } = await supabase.from('smart_bins').select('*');
      const { data: fleet } = await supabase.from('fleet_vehicles').select('*');
      const { data: reports } = await supabase.from('citizen_reports').select('*');

      const totalCounties = counties?.length || 0;
      const totalBins = bins?.length || 0;
      const totalFleet = fleet?.length || 0;
      const totalReports = reports?.length || 0;
      const totalCarbon = counties?.reduce((s, c) => s + (c.carbon_saved_tons || 0), 0) || 0;
      const avgCoverage = counties?.length ? counties.reduce((s, c) => s + (c.coverage_pct || 0), 0) / counties.length : 0;

      setStats({ totalCounties, totalBins, totalFleet, totalReports, totalCarbon, avgCoverage });
      setLoading(false);
    }
    fetch();
  }, []);

  return { stats, loading };
}
