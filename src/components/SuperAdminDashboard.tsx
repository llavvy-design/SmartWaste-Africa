import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCounties, useSmartBins, useFleetVehicles } from '../hooks/useSwanData';
import {
  Shield, Users, Activity, Settings, AlertTriangle, Database,
  ArrowRight, Server, Globe, Zap, Lock, Clock
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: counties } = useCounties();
  const { data: bins } = useSmartBins();
  const { data: fleet } = useFleetVehicles();

  const platformHealth = {
    uptime: 99.98,
    latency: 142,
    errors: 0,
    activeUsers: 247,
  };

  const agents = [
    { name: 'Scout', status: 'Online', confidence: 94, tasks: 1420, health: 97 },
    { name: 'Guardian', status: 'Online', confidence: 98, tasks: 387, health: 95 },
    { name: 'Hunter', status: 'Online', confidence: 88, tasks: 148, health: 92 },
    { name: 'Ranger', status: 'Online', confidence: 92, tasks: 1420, health: 94 },
    { name: 'Oracle', status: 'Processing', confidence: 95, tasks: 842, health: 96 },
    { name: 'Sentinel', status: 'Online', confidence: 99, tasks: 3847, health: 99 },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">System Console</h1>
              <p className="text-slate-400">Welcome back, {profile?.full_name || 'Super Admin'}. Global platform governance and health monitoring.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                <Shield className="w-3 h-3 inline mr-1" /> Super Admin
              </span>
            </div>
          </div>
        </motion.div>

        {/* Platform Health */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-2xl font-bold text-emerald-400">{platformHealth.uptime}%</div>
            <div className="text-xs text-slate-500">Uptime</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-400">{platformHealth.latency}ms</div>
            <div className="text-xs text-slate-500">Latency</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-400">{platformHealth.errors}</div>
            <div className="text-xs text-slate-500">Errors</div>
          </div>
          <div className="metric-card border-l-2 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-400">{platformHealth.activeUsers}</div>
            <div className="text-xs text-slate-500">Active Users</div>
          </div>
          <div className="metric-card border-l-2 border-l-violet-500">
            <div className="text-2xl font-bold text-violet-400">{counties.length}</div>
            <div className="text-xs text-slate-500">Counties</div>
          </div>
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-2xl font-bold text-amber-400">{bins.length}</div>
            <div className="text-xs text-slate-500">Total Bins</div>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
            <Users className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">User Management</h3>
            <p className="text-xs text-slate-500 mb-3">Create and manage all platform users</p>
            <button onClick={() => navigate('/users')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Manage Users <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-5">
            <Activity className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">AI Agent Control</h3>
            <p className="text-xs text-slate-500 mb-3">Monitor and configure AI agents</p>
            <button onClick={() => navigate('/agents')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View Agents <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5">
            <Shield className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">Security Center</h3>
            <p className="text-xs text-slate-500 mb-3">Audit logs, permissions, and access control</p>
            <button onClick={() => navigate('/audit')} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              View Audit <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-5">
            <Settings className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">System Settings</h3>
            <p className="text-xs text-slate-500 mb-3">Platform configuration and AI thresholds</p>
            <button onClick={() => navigate('/settings')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Configure <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5">
            <Database className="w-6 h-6 text-violet-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">Database Health</h3>
            <p className="text-xs text-slate-500 mb-3">Replication status, backups, and performance</p>
            <span className="text-xs text-emerald-400">Status: Healthy</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel p-5">
            <Globe className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-50 mb-1">Global Operations</h3>
            <p className="text-xs text-slate-500 mb-3">Multi-county overview and national metrics</p>
            <button onClick={() => navigate('/digital-twin')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View Map <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>

        {/* AI Agent Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" /> AI Agent Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {agents.map((agent) => (
              <div key={agent.name} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-sm font-bold text-slate-50 mb-1">{agent.name}</div>
                <div className={`text-xs ${agent.status === 'Online' ? 'text-emerald-400' : 'text-amber-400'} mb-2`}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 bg-current" />
                  {agent.status}
                </div>
                <div className="text-xs text-slate-500">Tasks: {agent.tasks}</div>
                <div className="text-xs text-slate-500">Confidence: {agent.confidence}%</div>
                <div className="text-xs text-slate-500">Health: {agent.health}%</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> System Alerts
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">All systems operational</span>
              </div>
              <span className="text-xs text-emerald-400">Nominal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Security audit: No vulnerabilities detected</span>
              </div>
              <span className="text-xs text-emerald-400">Clean</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Last database backup: 2 hours ago</span>
              </div>
              <span className="text-xs text-emerald-400">Current</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
