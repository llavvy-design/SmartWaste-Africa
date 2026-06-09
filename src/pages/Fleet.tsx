import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useFleetVehicles, useDrivers } from '../hooks/useSwanData';
import { Wrench, MapPin, ChevronDown, Clock, Activity, User } from 'lucide-react';

export default function Fleet() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: fleet } = useFleetVehicles(selectedCounty?.id);
  const { data: drivers } = useDrivers(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'available' | 'delayed' | 'maintenance'>('all');

  const filtered = fleet.filter(f => filterStatus === 'all' || f.status === filterStatus);

  const activeCount = fleet.filter(f => f.status === 'active').length;
  const availableCount = fleet.filter(f => f.status === 'available').length;
  const delayedCount = fleet.filter(f => f.status === 'delayed').length;
  const maintenanceCount = fleet.filter(f => f.maintenance_health !== 'healthy').length;

  const avgFuel = fleet.length ? fleet.reduce((s, f) => s + f.fuel_pct, 0) / fleet.length : 0;
  const avgEmission = fleet.length ? fleet.reduce((s, f) => s + f.emission_score, 0) / fleet.length : 0;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Fleet Command Center</h1>
          <p className="text-slate-400">Vehicle tracking, maintenance, and dispatch optimization</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative">
            <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">{selectedCounty?.name || 'All Counties'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {showCountyDropdown && (
              <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                <button onClick={() => { setSelectedCounty(null); setShowCountyDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 border-b border-slate-700">All Counties</button>
                {counties.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCounty(c); setShowCountyDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">{c.name}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            {(['all', 'active', 'available', 'delayed', 'maintenance'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${filterStatus === s ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Active', value: activeCount, color: 'text-emerald-400' },
            { label: 'Available', value: availableCount, color: 'text-blue-400' },
            { label: 'Delayed', value: delayedCount, color: 'text-amber-400' },
            { label: 'Maintenance', value: maintenanceCount, color: 'text-red-400' },
            { label: 'Avg Fuel', value: `${avgFuel.toFixed(0)}%`, color: 'text-violet-400' },
            { label: 'Avg Emission', value: `${avgEmission.toFixed(1)}`, color: 'text-rose-400' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="metric-card">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Fleet Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-50">Vehicle Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Fleet ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Fuel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Emission</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Health</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Capacity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">ETA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => {
                  const driver = drivers.find(d => d.id === vehicle.driver_id);
                  const statusColors: Record<string, string> = {
                    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    available: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    in_transit: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    delayed: 'bg-red-500/10 text-red-400 border-red-500/20',
                    maintenance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                  };
                  return (
                    <tr key={vehicle.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-50">{vehicle.fleet_id}</div>
                        {driver && <div className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" />{driver.name}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{vehicle.vehicle_type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusColors[vehicle.status] || 'bg-slate-800 text-slate-400'}`}>
                          <Activity className="w-3 h-3 mr-1" />{vehicle.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${vehicle.fuel_pct > 50 ? 'bg-emerald-500' : vehicle.fuel_pct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${vehicle.fuel_pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{vehicle.fuel_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{vehicle.emission_score}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${vehicle.maintenance_health === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          <Wrench className="w-3 h-3 inline mr-1" />{vehicle.maintenance_health}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{vehicle.remaining_capacity_kg} kg</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{vehicle.eta_minutes}m
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-slate-500 text-sm">No vehicles match the current filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
