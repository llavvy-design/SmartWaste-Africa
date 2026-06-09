import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCounties, useSmartBins, useFleetVehicles, useCitizenReports, useIncidents } from '../hooks/useSwanData';
import {
  Users, Shield, Truck, Trash2, AlertTriangle, BarChart3,
  Settings, ArrowRight, Activity, CheckCircle, Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: counties } = useCounties();
  const { data: bins } = useSmartBins();
  const { data: fleet } = useFleetVehicles();
  const { data: reports } = useCitizenReports();
  const { data: incidents } = useIncidents();

  const county = counties.find(c => c.id === profile?.county_id);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Municipal Operations</h1>
              <p className="text-slate-400">Welcome back, {profile?.full_name || 'Administrator'}. Manage county operations and teams.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20">
                <Shield className="w-3 h-3 inline mr-1" /> Municipal Admin
              </span>
            </div>
          </div>
        </motion.div>

        {/* County Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-2xl font-bold text-slate-50">{county?.name || 'All'}</div>
            <div className="text-xs text-slate-500">County</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-400">{bins.length}</div>
            <div className="text-xs text-slate-500">Smart Bins</div>
          </div>
          <div className="metric-card border-l-2 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-400">{fleet.length}</div>
            <div className="text-xs text-slate-500">Fleet</div>
          </div>
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-2xl font-bold text-amber-400">{reports.length}</div>
            <div className="text-xs text-slate-500">Reports</div>
          </div>
          <div className="metric-card border-l-2 border-l-red-500">
            <div className="text-2xl font-bold text-red-400">{incidents.filter(i => i.status !== 'resolved').length}</div>
            <div className="text-xs text-slate-500">Active Incidents</div>
          </div>
          <div className="metric-card border-l-2 border-l-violet-500">
            <div className="text-2xl font-bold text-violet-400">{county?.coverage_pct || 0}%</div>
            <div className="text-xs text-slate-500">Coverage</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
            <Users className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">User Management</h3>
            <p className="text-xs text-slate-500 mb-3">Create and manage platform users</p>
            <button onClick={() => navigate('/users')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Manage Users <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-5">
            <Truck className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">Contractor Registry</h3>
            <p className="text-xs text-slate-500 mb-3">Manage contractor assignments and compliance</p>
            <button onClick={() => navigate('/contractor')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View Contractors <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5">
            <Trash2 className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">Asset Management</h3>
            <p className="text-xs text-slate-500 mb-3">Manage smart bins, fleet, and infrastructure</p>
            <button onClick={() => navigate('/bins')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View Assets <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-5">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">Incident Center</h3>
            <p className="text-xs text-slate-500 mb-3">Review and manage all incidents</p>
            <button onClick={() => navigate('/incidents')} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              View Incidents <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5">
            <BarChart3 className="w-6 h-6 text-violet-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">County Analytics</h3>
            <p className="text-xs text-slate-500 mb-3">View performance metrics and reports</p>
            <button onClick={() => navigate('/reports')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View Reports <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel p-5">
            <Settings className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">System Settings</h3>
            <p className="text-xs text-slate-500 mb-3">Configure platform settings and AI agents</p>
            <button onClick={() => navigate('/settings')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Configure <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Recent Activity
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Route TRK-042 completed in Kibera</span>
              </div>
              <span className="text-xs text-slate-500">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-300">New incident reported in Westlands</span>
              </div>
              <span className="text-xs text-slate-500">15 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Dispatcher assigned incident to Team Alpha</span>
              </div>
              <span className="text-xs text-slate-500">32 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-slate-300">New contractor registered: GreenWaste Ltd</span>
              </div>
              <span className="text-xs text-slate-500">1h ago</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
