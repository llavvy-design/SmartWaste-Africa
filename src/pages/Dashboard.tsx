import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCounty } from '../context/CountyContext';
import { useCounties, useSmartBins, useFleetVehicles, useDispatchQueue, useCitizenReports, useIncidents, useAggregateStats } from '../hooks/useSwanData';
import {
  Truck, CheckCircle, Clock, AlertTriangle, Wrench, MapPin, ArrowRight,
  TrendingUp, TrendingDown, Trash2, Users, Activity, Shield, Zap
} from 'lucide-react';

function AnimatedBar({ value, max, color }: { value: number; max: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value / max) * 100), 100);
    return () => clearTimeout(t);
  }, [value, max]);
  return (
    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedCounty } = useCounty();
  const { data: allCounties } = useCounties();
  const { data: bins } = useSmartBins(selectedCounty?.id);
  const { data: fleet } = useFleetVehicles(selectedCounty?.id);
  const { data: dispatch } = useDispatchQueue(selectedCounty?.id);
  const { data: reports } = useCitizenReports(selectedCounty?.id);
  const { data: incidents } = useIncidents(selectedCounty?.id);
  const { stats } = useAggregateStats();

  const county = selectedCounty;
  const counties = allCounties;

  const activeBins = bins.filter(b => b.fill_level_pct > 0).length;
  const criticalBins = bins.filter(b => b.fill_level_pct > 80).length;
  const overflowBins = bins.filter(b => b.fill_level_pct > 95).length;
  const activeFleet = fleet.filter(f => f.status === 'active').length;
  const availableFleet = fleet.filter(f => f.status === 'available').length;
  const maintenanceFleet = fleet.filter(f => f.maintenance_health !== 'healthy').length;
  const openReports = reports.filter(r => r.status !== 'resolved').length;
  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;

  const fleetData = [
    { label: 'Active Trucks', value: activeFleet, max: Math.max(fleet.length, 1), color: 'bg-emerald-500', icon: Truck },
    { label: 'Available Assets', value: availableFleet, max: Math.max(fleet.length, 1), color: 'bg-blue-500', icon: CheckCircle },
    { label: 'In Transit', value: fleet.filter(f => f.status === 'in_transit').length, max: Math.max(fleet.length, 1), color: 'bg-amber-500', icon: Clock },
    { label: 'Maintenance Alerts', value: maintenanceFleet, max: Math.max(fleet.length, 1), color: 'bg-orange-500', icon: Wrench },
    { label: 'Delayed', value: fleet.filter(f => f.status === 'delayed').length, max: Math.max(fleet.length, 1), color: 'bg-red-500', icon: AlertTriangle },
  ];

  const quickStats = [
    { label: 'Smart Bins', value: activeBins, icon: Trash2, color: 'text-emerald-400', trend: '+3.2%' },
    { label: 'Critical', value: criticalBins, icon: AlertTriangle, color: 'text-red-400', trend: '-12%' },
    { label: 'Fleet Active', value: activeFleet, icon: Truck, color: 'text-blue-400', trend: '+5.1%' },
    { label: 'Reports', value: openReports, icon: Users, color: 'text-amber-400', trend: '+8.4%' },
    { label: 'Incidents', value: openIncidents, icon: Shield, color: 'text-rose-400', trend: '-22%' },
    { label: 'Overflow', value: overflowBins, icon: Zap, color: 'text-violet-400', trend: '-18%' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-50">Mission Control Center</h1>
            {county && (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">
                {county.name}
              </span>
            )}
          </div>
          <p className="text-slate-400">
            {county
              ? `Real-time municipal operations dashboard for ${county.name} County`
              : 'National overview — select a county for detailed operations'}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {quickStats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>{stat.trend}</span>
              </div>
              <div className="text-2xl font-bold text-slate-50">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fleet Performance */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" /> Fleet Performance
            </h2>
            <p className="text-xs text-slate-500 mb-5">{fleet.length} vehicles tracked</p>
            <div className="space-y-4">
              {fleetData.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-50">{item.value}</span>
                  </div>
                  <AnimatedBar value={item.value} max={item.max} color={item.color} />
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/fleet')} className="w-full mt-4 btn-secondary text-sm py-2 flex items-center justify-center gap-2">
              View Fleet Command <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Bin Status + County Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" /> {county ? `${county.name} Overview` : 'National Overview'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{county ? `${bins.length} smart bins across ${county.name}` : `${stats.totalBins} smart bins across ${counties.length} counties`}</p>

            {county ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Population</div>
                  <div className="text-xl font-bold text-slate-50">{(county.population / 1000000).toFixed(1)}M</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Coverage</div>
                  <div className="text-xl font-bold text-emerald-400">{county.coverage_pct}%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Carbon Saved</div>
                  <div className="text-xl font-bold text-slate-50">{county.carbon_saved_tons} MT</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Equity Score</div>
                  <div className="text-xl font-bold text-violet-400">{county.equity_score}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Total Counties</div>
                  <div className="text-xl font-bold text-slate-50">{counties.length}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Total Bins</div>
                  <div className="text-xl font-bold text-emerald-400">{stats.totalBins}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Total Carbon</div>
                  <div className="text-xl font-bold text-slate-50">{stats.totalCarbon.toFixed(1)} MT</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Avg Coverage</div>
                  <div className="text-xl font-bold text-violet-400">{stats.avgCoverage.toFixed(1)}%</div>
                </div>
              </div>
            )}

            {/* Dispatch Queue */}
            <div className="border-t border-slate-700/50 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-50">Dispatch Queue</h3>
                <span className="text-xs text-slate-500">{dispatch.length} active jobs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase">
                      <th className="text-left py-2">Priority</th>
                      <th className="text-left py-2">Location</th>
                      <th className="text-left py-2">Fill</th>
                      <th className="text-left py-2">Wait</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatch.slice(0, 6).map((job) => (
                      <tr key={job.id} className="border-t border-slate-700/30">
                        <td className="py-2">
                          <span className={`font-bold ${job.is_guardian_override ? 'text-red-400' : 'text-slate-300'}`}>#{job.priority}</span>
                        </td>
                        <td className="py-2 text-slate-400">{job.bin_id?.slice(0, 8)}...</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${job.fill_level_pct > 80 ? 'bg-red-500' : job.fill_level_pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${job.fill_level_pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400">{job.fill_level_pct}%</span>
                          </div>
                        </td>
                        <td className="py-2 text-slate-400">{job.wait_time_minutes}m</td>
                        <td className="py-2">
                          {job.is_guardian_override ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Guardian
                            </span>
                          ) : (
                            <span className="status-badge status-badge-green">{job.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {dispatch.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-slate-500 text-sm">No active dispatch jobs</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-5">
            <h3 className="text-sm font-bold text-slate-50 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Bin Health
            </h3>
            <div className="space-y-2">
              {['healthy', 'warning', 'critical', 'offline'].map(status => {
                const count = bins.filter(b => b.sensor_health === status).length;
                const colors = { healthy: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-red-400', offline: 'text-slate-500' };
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className={`capitalize ${colors[status as keyof typeof colors]}`}>{status}</span>
                    <span className="text-slate-50 font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-5">
            <h3 className="text-sm font-bold text-slate-50 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Sustainability
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Carbon Prevented</span>
                <span className="text-emerald-400 font-bold">{county ? county.carbon_saved_tons : stats.totalCarbon.toFixed(1)} MT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fuel Efficiency</span>
                <span className="text-blue-400 font-bold">{county ? county.fuel_saved_pct : 28}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Equity Score</span>
                <span className="text-violet-400 font-bold">{county ? county.equity_score : 88.4}</span>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-5">
            <h3 className="text-sm font-bold text-slate-50 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" /> Recent Activity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">New Reports</span>
                <span className="text-slate-50 font-bold">{reports.filter(r => new Date(r.created_at).getTime() > Date.now() - 86400000).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Open Incidents</span>
                <span className="text-slate-50 font-bold">{openIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overflow Risk</span>
                <span className="text-amber-400 font-bold">{criticalBins} bins</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
