import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Radio, Route, Truck, AlertTriangle, MapPin, Clock,
  Activity, Users, ArrowRight, Zap, Bell
} from 'lucide-react';

export default function DispatcherDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const dispatchQueue = [
    { id: 'DQ-001', priority: 1, zone: 'Kibera', type: 'Critical Overflow', eta: '15 min', status: 'urgent', vehicle: 'TRK-042' },
    { id: 'DQ-002', priority: 2, zone: 'Westlands', type: 'Scheduled Route', eta: '45 min', status: 'normal', vehicle: 'TRK-017' },
    { id: 'DQ-003', priority: 3, zone: 'CBD', type: 'Citizen Report', eta: '1h 20m', status: 'normal', vehicle: 'TRK-031' },
    { id: 'DQ-004', priority: 4, zone: 'Eastleigh', type: 'Maintenance', eta: '2h', status: 'low', vehicle: 'TRK-009' },
  ];

  const fleetStatus = [
    { id: 'TRK-042', status: 'active', zone: 'Kibera', driver: 'John M.', fuel: 72 },
    { id: 'TRK-017', status: 'available', zone: 'Depot', driver: 'Alice K.', fuel: 91 },
    { id: 'TRK-031', status: 'in_transit', zone: 'CBD', driver: 'Peter O.', fuel: 45 },
    { id: 'TRK-009', status: 'maintenance', zone: 'Garage', driver: '—', fuel: 0 },
  ];

  const liveTelemetry = [
    { metric: 'Active Nodes', value: 1420, change: '+3', color: 'text-emerald-400' },
    { metric: 'Offline Nodes', value: 22, change: '-1', color: 'text-amber-400' },
    { metric: 'Overflow Alerts', value: 8, change: '+2', color: 'text-red-400' },
    { metric: 'Queue Depth', value: 12, change: '0', color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Dispatch Center</h1>
              <p className="text-slate-400">Welcome back, {profile?.full_name || 'Dispatcher'}. Coordinate fleet operations and monitor live telemetry.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-violet-500/10 text-violet-400 text-xs rounded-full border border-violet-500/20">
                <Radio className="w-3 h-3 inline mr-1" /> Dispatcher
              </span>
            </div>
          </div>
        </motion.div>

        {/* Live Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {liveTelemetry.map((t, i) => (
            <motion.div key={t.metric} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="metric-card">
              <div className={`text-2xl font-bold ${t.color}`}>{t.value}</div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">{t.metric}</span>
                <span className={`text-xs ${t.change.startsWith('+') ? 'text-emerald-400' : t.change.startsWith('-') ? 'text-amber-400' : 'text-slate-500'}`}>
                  {t.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dispatch Queue + Fleet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <Route className="w-5 h-5 text-emerald-400" /> Dispatch Queue
              </h2>
              <button onClick={() => navigate('/fleet')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {dispatchQueue.map((job) => (
                <div key={job.id} className={`p-3 rounded-lg border ${job.status === 'urgent' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/50 border-slate-700/30'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-50">{job.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${job.status === 'urgent' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                      #{job.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.zone}</span>
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {job.vehicle}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.eta}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{job.type}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" /> Fleet Tracker
              </h2>
              <button onClick={() => navigate('/fleet')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {fleetStatus.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${vehicle.status === 'active' ? 'bg-emerald-500' : vehicle.status === 'available' ? 'bg-blue-500' : vehicle.status === 'in_transit' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="text-sm font-bold text-slate-50">{vehicle.id}</div>
                      <div className="text-xs text-slate-500">{vehicle.driver} • {vehicle.zone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 capitalize">{vehicle.status.replace('_', ' ')}</div>
                    {vehicle.fuel > 0 && <div className="text-xs text-slate-400">{vehicle.fuel}% fuel</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => navigate('/incidents')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">Incidents</div>
            <div className="text-xs text-slate-500">Manage emergency responses</div>
          </button>
          <button onClick={() => navigate('/telemetry')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <Activity className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">Telemetry</div>
            <div className="text-xs text-slate-500">Monitor sensor networks</div>
          </button>
          <button onClick={() => navigate('/bins')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">Smart Bins</div>
            <div className="text-xs text-slate-500">Check fill levels & status</div>
          </button>
          <button onClick={() => navigate('/gis')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <MapPin className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">GIS Map</div>
            <div className="text-xs text-slate-500">View geographic layers</div>
          </button>
        </div>
      </div>
    </div>
  );
}
