import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCounties } from '../hooks/useSwanData';
import {
  Route, Truck, Clock, CheckCircle, AlertTriangle, Star,
  Upload, MapPin, Calendar, ArrowRight, TrendingUp, Target
} from 'lucide-react';

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: counties } = useCounties();
  const county = counties.find(c => c.id === profile?.county_id);

  const assignedRoutes = [
    { id: 'RT-001', zone: 'Nairobi CBD', stops: 8, completed: 3, priority: 'high', eta: '2h 15m' },
    { id: 'RT-002', zone: 'Westlands', stops: 6, completed: 6, priority: 'medium', eta: 'Completed' },
    { id: 'RT-003', zone: 'Kibera', stops: 12, completed: 0, priority: 'critical', eta: '3h 30m' },
  ];

  const performance = {
    routesCompleted: 47,
    onTimeRate: 94,
    rating: 4.8,
    fuelEfficiency: 87,
    pendingUploads: 2,
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Contractor Portal</h1>
              <p className="text-slate-400">Welcome back, {profile?.full_name || 'Contractor'}. Manage your routes and collections.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                <Star className="w-3 h-3 inline mr-1" /> {performance.rating}/5.0
              </span>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-2xl font-bold text-slate-50">{performance.routesCompleted}</div>
            <div className="text-xs text-slate-500">Routes Done</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-400">{performance.onTimeRate}%</div>
            <div className="text-xs text-slate-500">On-Time</div>
          </div>
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-2xl font-bold text-amber-400">{performance.rating}</div>
            <div className="text-xs text-slate-500">Rating</div>
          </div>
          <div className="metric-card border-l-2 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-400">{performance.fuelEfficiency}%</div>
            <div className="text-xs text-slate-500">Fuel Eff.</div>
          </div>
          <div className="metric-card border-l-2 border-l-rose-500">
            <div className="text-2xl font-bold text-rose-400">{performance.pendingUploads}</div>
            <div className="text-xs text-slate-500">Pending Uploads</div>
          </div>
        </div>

        {/* Today's Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-emerald-400" /> Today's Routes
            </h2>
            <div className="space-y-3">
              {assignedRoutes.map((route) => (
                <div key={route.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-50">{route.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${route.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : route.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {route.priority}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{route.eta}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <MapPin className="w-3 h-3" /> {route.zone}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(route.completed / route.stops) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{route.completed}/{route.stops}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle className="w-3 h-3 inline mr-1" /> Mark Complete
                    </button>
                    <button className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">
                      <Upload className="w-3 h-3" /> Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="glass-panel p-5">
              <h2 className="text-lg font-bold text-slate-50 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" /> Fleet Overview
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Assigned Vehicles</span>
                  <span className="text-slate-50 font-bold">3</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Active Now</span>
                  <span className="text-emerald-400 font-bold">2</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">In Maintenance</span>
                  <span className="text-amber-400 font-bold">1</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Fuel (Avg)</span>
                  <span className="text-slate-50 font-bold">68%</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h2 className="text-lg font-bold text-slate-50 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Performance Targets
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">On-Time Completion</span>
                    <span className="text-emerald-400">94%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Route Efficiency</span>
                    <span className="text-blue-400">87%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Customer Rating</span>
                    <span className="text-amber-400">4.8/5</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
