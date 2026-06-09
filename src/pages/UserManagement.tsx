import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCounties } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import {
  Users, Plus, Search, Shield, ChevronDown, CheckCircle, X, Lock,
  Mail, Phone, User, MapPin, Building, AlertTriangle, Loader2
} from 'lucide-react';

const roles = [
  { id: 'contractor', label: 'Contractor', color: 'text-blue-400' },
  { id: 'dispatcher', label: 'Dispatcher', color: 'text-violet-400' },
  { id: 'municipal_admin', label: 'Municipal Admin', color: 'text-amber-400' },
  { id: 'executive', label: 'Executive', color: 'text-emerald-400' },
  { id: 'super_admin', label: 'Super Admin', color: 'text-red-400' },
];

const accountStatuses = ['active', 'pending', 'suspended', 'locked', 'disabled'];

export default function UserManagement() {
  const { user, createUser } = useAuth();
  const { data: counties } = useCounties();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'contractor',
    county_id: '', organization: '', department: '',
  });

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    const { error } = await createUser({
      email: formData.email,
      password: formData.password || 'TempPass123!',
      full_name: formData.full_name,
      phone: formData.phone,
      role: formData.role,
      county_id: formData.county_id,
      organization: formData.organization,
      department: formData.department,
    });
    setCreating(false);
    if (error) {
      setFormError(error);
    } else {
      setCreated(true);
      setFormData({
        full_name: '', email: '', phone: '', password: '', role: 'contractor',
        county_id: '', organization: '', department: '',
      });
      fetchUsers();
      setTimeout(() => {
        setCreated(false);
        setShowCreateModal(false);
      }, 2000);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    await supabase.from('profiles').update({ account_status: status }).eq('id', userId);
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action: 'user_status_changed',
      entity_type: 'profiles',
      entity_id: userId,
      details: { new_status: status },
    });
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.account_status?.toLowerCase().includes(q)
    );
  });

  const statusColors: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    suspended: 'text-red-400 bg-red-500/10 border-red-500/20',
    locked: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    disabled: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">User Management</h1>
              <p className="text-slate-400">Create and manage platform users. Only Municipal Admin and Super Admin can access.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create User
            </button>
          </div>
        </motion.div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, role..."
              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="text-xs text-slate-500">{filtered.length} users</div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">County</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Last Login</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-50">{u.full_name || '—'}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium capitalize text-slate-300">{u.role?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {counties.find(c => c.id === u.county_id)?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusColors[u.account_status] || statusColors.active}`}>
                          {u.account_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.account_status}
                            onChange={(e) => handleStatusChange(u.id, e.target.value)}
                            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:border-emerald-500 outline-none"
                          >
                            {accountStatuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Create User Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="glass-panel-strong p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-50">Create New User</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Temporary Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Leave blank for auto-generated"
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">User will be forced to change password on first login.</p>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      required
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">County Assignment</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.county_id}
                        onChange={(e) => setFormData({ ...formData, county_id: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      >
                        <option value="">Select County</option>
                        {counties.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Organization</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-400">
                      <AlertTriangle className="w-4 h-4" /> {formError}
                    </div>
                  )}

                  {created && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-sm text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> User created successfully!
                    </div>
                  )}

                  <button type="submit" disabled={creating} className="w-full btn-primary disabled:opacity-50">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
