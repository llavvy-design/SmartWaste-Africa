import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCounties, useSmartBins, useFleetVehicles } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import {
  Shield, Users, Activity, Settings, AlertTriangle, Database,
  ArrowRight, Server, Globe, Zap, Lock, Clock, RefreshCw,
  CheckCircle, XCircle, RefreshCcw, UserPlus, Key, Crown
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  citizen: 'Citizen',
  contractor: 'Contractor',
  dispatcher: 'Dispatcher',
  municipal_admin: 'Municipal Admin',
  executive: 'Executive',
  super_admin: 'Super Admin',
};

const roleColors: Record<string, string> = {
  citizen: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  contractor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  dispatcher: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  municipal_admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  executive: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  super_admin: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { profile, setDemoRole } = useAuth();
  const { data: counties } = useCounties();
  const { data: bins } = useSmartBins();
  const { data: fleet } = useFleetVehicles();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

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

  const demoEmails = [
    'citizen@smartwaste.africa',
    'contractor@smartwaste.africa',
    'dispatcher@smartwaste.africa',
    'admin@smartwaste.africa',
    'executive@smartwaste.africa',
    'superadmin@smartwaste.africa',
  ];

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoadingUsers(false);

    // Extract demo accounts
    const demos = (data || []).filter(u => demoEmails.includes(u.email));
    setDemoAccounts(demos);
  };

  const fetchPermissions = async () => {
    const { data } = await supabase
      .from('permission_templates')
      .select('*')
      .order('role_name');
    setPermissions(data || []);
  };

  const handleDemoLogin = async (role: string) => {
    setDemoRole(role);
    const dashboardRoutes: Record<string, string> = {
      citizen: '/citizen',
      contractor: '/contractor',
      dispatcher: '/dispatcher',
      municipal_admin: '/admin',
      executive: '/executive',
      super_admin: '/superadmin',
    };
    navigate(dashboardRoutes[role] || '/dashboard');
  };

  const handleRefreshUser = async (userId: string) => {
    await supabase.from('audit_logs').insert({
      user_id: profile?.id || null,
      action: 'user_refreshed',
      entity_type: 'profiles',
      entity_id: userId,
      details: { refreshed_by: profile?.id },
    });
    fetchUsers();
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">System Console</h1>
              <p className="text-slate-400">Welcome, {profile?.full_name || 'Super Admin'}. Global platform governance and health monitoring.</p>
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
            <div className="text-2xl font-bold text-blue-400">{users.length}</div>
            <div className="text-xs text-slate-500">Total Users</div>
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

        {/* Demo Mode Quick Switcher */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" /> Demo Role Switcher
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Instantly switch between role perspectives for capstone demonstration.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {['citizen', 'contractor', 'dispatcher', 'municipal_admin', 'executive', 'super_admin'].map((role) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                className={`p-4 rounded-lg border transition-all text-left hover:border-emerald-500/30 ${roleColors[role]}`}
              >
                <div className="text-sm font-bold mb-1">{roleLabels[role]}</div>
                <div className="text-xs opacity-70">Switch to view</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Users & Roles Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Users & Roles
              </h2>
              <button onClick={() => fetchUsers()} className="text-xs text-emerald-400 hover:text-emerald-300">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {users.slice(0, 15).map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <div>
                      <div className="text-sm font-bold text-slate-50">{u.full_name || u.email}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${roleColors[u.role] || 'text-slate-400 bg-slate-500/10'}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate('/users')} className="w-full mt-4 btn-secondary text-sm">
              Manage All Users <ArrowRight className="w-4 h-4 inline" />
            </button>
          </motion.div>

          {/* Permissions Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" /> Permission Templates
              </h2>
            </div>

            <div className="space-y-2">
              {permissions.map((p) => (
                <div key={p.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${roleColors[p.role_name]?.split(' ')[0] || 'text-slate-300'}`}>
                      {roleLabels[p.role_name] || p.role_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(p.permissions as string[]).length} permissions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(p.permissions as string[]).slice(0, 4).map((perm: string) => (
                      <span key={perm} className="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-400">
                        {perm}
                      </span>
                    ))}
                    {(p.permissions as string[]).length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-500">
                        +{(p.permissions as string[]).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/permissions')} className="w-full mt-4 btn-secondary text-sm">
              Manage Permissions <ArrowRight className="w-4 h-4 inline" />
            </button>
          </motion.div>
        </div>

        {/* Demo Accounts Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" /> Demo Account Management
            </h2>
            <button onClick={fetchUsers} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">All demo accounts use password: <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400">Demo@2024</code></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Role</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Email</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Profile</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {demoEmails.map((email) => {
                  const existingUser = demoAccounts.find(u => u.email === email);
                  const rawRole = email.split('@')[0];
                  const role = rawRole === 'admin' ? 'municipal_admin' : rawRole === 'superadmin' ? 'super_admin' : rawRole;
                  return (
                    <tr key={email} className="border-b border-slate-700/30 hover:bg-slate-800/20">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${roleColors[role] || 'text-slate-400 bg-slate-500/10'}`}>
                          <Shield className="w-3 h-3" />
                          {roleLabels[role] || role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300 font-mono">{email}</td>
                      <td className="px-4 py-3">
                        {existingUser ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-400">
                            <XCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {existingUser ? existingUser.full_name : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDemoLogin(role)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 mr-3"
                        >
                          Switch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Admin Modules Quick Access */}
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
