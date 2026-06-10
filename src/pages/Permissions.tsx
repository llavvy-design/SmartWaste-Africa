import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Shield, Key, Check, X, Plus, Trash2, Copy, Save, Loader2,
  AlertTriangle, ChevronDown, ChevronRight, Lock, Unlock
} from 'lucide-react';

interface PermissionTemplate {
  id: string;
  role_name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

const allPermissions = [
  { category: 'Citizen Portal', perms: ['citizen_portal', 'submit_reports', 'view_own_reports', 'request_pickup', 'upload_images', 'view_recycling_education'] },
  { category: 'Contractor Portal', perms: ['contractor_portal', 'view_assigned_routes', 'view_assigned_incidents', 'update_route_progress', 'upload_completion_photos', 'upload_proof_of_collection', 'view_performance_metrics'] },
  { category: 'Dispatcher Operations', perms: ['dispatcher_portal', 'view_all_incidents', 'manage_dispatch_queue', 'assign_routes', 'assign_contractors', 'monitor_fleet_activity', 'view_telemetry', 'receive_alerts'] },
  { category: 'Municipal Admin', perms: ['municipal_admin_portal', 'manage_users', 'manage_contractors', 'review_reports', 'review_incidents', 'view_county_analytics', 'manage_smart_bins', 'manage_fleet_assets', 'user_management', 'bins', 'fleet', 'incidents', 'audit_trail'] },
  { category: 'Executive', perms: ['executive_portal', 'view_reports', 'view_sustainability_metrics', 'view_esg_metrics', 'view_county_performance', 'view_financial_insights', 'digital_twin', 'analytics'] },
  { category: 'System', perms: ['all', 'system_settings', 'security_center', 'ai_configuration', 'platform_health'] },
  { category: 'Common', perms: ['update_own_profile', 'receive_notifications', 'change_password'] },
];

const roleLabels: Record<string, string> = {
  citizen: 'Citizen',
  contractor: 'Contractor',
  dispatcher: 'Dispatcher',
  municipal_admin: 'Municipal Admin',
  executive: 'Executive',
  super_admin: 'Super Admin',
};

export default function Permissions() {
  const { user, hasRole } = useAuth();
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);
  const [editingPerms, setEditingPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneData, setCloneData] = useState({ from_role: '', to_role: '', to_label: '' });
  const [searchPerm, setSearchPerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('permission_templates')
      .select('*')
      .order('role_name');
    setTemplates(data || []);
    setLoading(false);
  };

  const handleSelectTemplate = (template: PermissionTemplate) => {
    setSelectedTemplate(template);
    setEditingPerms(template.permissions || []);
  };

  const togglePermission = (perm: string) => {
    if (editingPerms.includes(perm)) {
      setEditingPerms(editingPerms.filter(p => p !== perm));
    } else {
      setEditingPerms([...editingPerms, perm]);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    const { error } = await supabase
      .from('permission_templates')
      .update({ permissions: editingPerms, updated_at: new Date().toISOString() })
      .eq('id', selectedTemplate.id);

    if (!error) {
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: 'permissions_updated',
        entity_type: 'permission_templates',
        entity_id: selectedTemplate.id,
        details: { role: selectedTemplate.role_name, permissions: editingPerms },
      });
      fetchTemplates();
      setSelectedTemplate({ ...selectedTemplate, permissions: editingPerms });
    }
    setSaving(false);
  };

  const handleClone = async () => {
    if (!cloneData.from_role || !cloneData.to_role || !cloneData.to_label) return;
    const source = templates.find(t => t.role_name === cloneData.from_role);
    if (!source) return;

    const { error } = await supabase
      .from('permission_templates')
      .insert({
        role_name: cloneData.to_role,
        description: `Cloned from ${cloneData.from_role}`,
        permissions: source.permissions,
      });

    if (!error) {
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: 'permission_template_cloned',
        entity_type: 'permission_templates',
        entity_id: cloneData.to_role,
        details: { from: cloneData.from_role, to: cloneData.to_role },
      });
      fetchTemplates();
      setShowCloneModal(false);
      setCloneData({ from_role: '', to_role: '', to_label: '' });
    }
  };

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const filteredPermissions = allPermissions.map(cat => ({
    ...cat,
    perms: cat.perms.filter(p => p.toLowerCase().includes(searchPerm.toLowerCase())),
  })).filter(cat => cat.perms.length > 0);

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      citizen: 'text-emerald-400 border-emerald-500/30',
      contractor: 'text-blue-400 border-blue-500/30',
      dispatcher: 'text-violet-400 border-violet-500/30',
      municipal_admin: 'text-amber-400 border-amber-500/30',
      executive: 'text-teal-400 border-teal-500/30',
      super_admin: 'text-red-400 border-red-500/30',
    };
    return colors[role] || 'text-slate-400 border-slate-500/30';
  };

  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Access Denied</h1>
          <p className="text-slate-400">Only Super Administrators can manage permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-400" />
                Permission Management
              </h1>
              <p className="text-slate-400">Configure role-based access control and permission templates.</p>
            </div>
            <button
              onClick={() => setShowCloneModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Clone Role Template
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Templates List */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-4">
              <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" /> Role Templates
              </h2>
              <div className="space-y-2">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  </div>
                ) : (
                  templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTemplate?.id === template.id
                          ? `${getRoleColor(template.role_name)} bg-slate-800/50`
                          : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-300">
                            {roleLabels[template.role_name] || template.role_name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{template.permissions?.length || 0} permissions</div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Permission Editor */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-50">
                      {roleLabels[selectedTemplate.role_name]} Permissions
                    </h2>
                    <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    value={searchPerm}
                    onChange={(e) => setSearchPerm(e.target.value)}
                    placeholder="Search permissions..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  {filteredPermissions.map((category) => (
                    <div key={category.category} className="border border-slate-700/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.category)}
                        className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedCategories.includes(category.category) ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-sm font-medium text-slate-300">{category.category}</span>
                          <span className="text-xs text-slate-500">
                            ({category.perms.filter(p => editingPerms.includes(p)).length}/{category.perms.length})
                          </span>
                        </div>
                      </button>
                      {expandedCategories.includes(category.category) && (
                        <div className="p-3 bg-slate-800/20 grid grid-cols-2 gap-2">
                          {category.perms.map((perm) => (
                            <button
                              key={perm}
                              onClick={() => togglePermission(perm)}
                              className={`flex items-center gap-2 p-2 rounded text-left transition-all ${
                                editingPerms.includes(perm)
                                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                                  : 'bg-slate-800/50 border border-slate-700/30 hover:border-slate-600'
                              }`}
                            >
                              {editingPerms.includes(perm) ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <X className="w-4 h-4 text-slate-500" />
                              )}
                              <span className="text-xs text-slate-300">{perm}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Summary */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="text-xs text-slate-500 mb-2">Active Permissions ({editingPerms.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {editingPerms.map((perm) => (
                      <span
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 cursor-pointer hover:bg-emerald-500/20"
                      >
                        {perm}
                      </span>
                    ))}
                    {editingPerms.length === 0 && (
                      <span className="text-xs text-slate-500">No permissions selected</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel p-8 text-center">
                <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-50 mb-2">Select a Role Template</h3>
                <p className="text-sm text-slate-500">Choose a role from the left panel to view and edit its permissions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Permission Matrix Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 glass-panel p-4"
        >
          <h2 className="text-lg font-bold text-slate-50 mb-4">Permission Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-3 py-2 text-slate-400">Permission</th>
                  {templates.map((t) => (
                    <th key={t.id} className="text-center px-2 py-2 text-slate-400">
                      {roleLabels[t.role_name] || t.role_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.flatMap(cat => cat.perms).map((perm) => (
                  <tr key={perm} className="border-b border-slate-700/30 hover:bg-slate-800/20">
                    <td className="px-3 py-2 text-slate-300">{perm}</td>
                    {templates.map((t) => (
                      <td key={t.id} className="text-center px-2 py-2">
                        {t.permissions?.includes(perm) ? (
                          <Check className="w-4 h-4 text-emerald-400 inline" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 inline" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Clone Modal */}
        <AnimatePresence>
          {showCloneModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-bold text-slate-50 mb-4">Clone Role Template</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Source Role</label>
                    <select
                      value={cloneData.from_role}
                      onChange={(e) => setCloneData({ ...cloneData, from_role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
                    >
                      <option value="">Select source role</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.role_name}>{roleLabels[t.role_name]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">New Role Name (slug)</label>
                    <input
                      type="text"
                      value={cloneData.to_role}
                      onChange={(e) => setCloneData({ ...cloneData, to_role: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="e.g., regional_admin"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Display Label</label>
                    <input
                      type="text"
                      value={cloneData.to_label}
                      onChange={(e) => setCloneData({ ...cloneData, to_label: e.target.value })}
                      placeholder="e.g., Regional Administrator"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCloneModal(false)} className="flex-1 btn-secondary">Cancel</button>
                    <button onClick={handleClone} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" /> Clone
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
