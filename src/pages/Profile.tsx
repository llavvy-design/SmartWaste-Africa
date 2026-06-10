import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCounties, useSubcounties, useAuditLogs } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Phone, MapPin, Shield, Save, CheckCircle, LogOut,
  Lock, Key, Eye, EyeOff, Bell, History, Calendar, Clock, Monitor,
  Smartphone, Globe, AlertTriangle, Loader2, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  citizen: 'Citizen',
  contractor: 'Contractor',
  dispatcher: 'Dispatcher',
  municipal_admin: 'Municipal Admin',
  executive: 'Executive',
  super_admin: 'Super Admin',
};

const roleDescriptions: Record<string, string> = {
  citizen: 'Community reporting and engagement capabilities.',
  contractor: 'Waste collection execution and route management.',
  dispatcher: 'Operational coordination and fleet management.',
  municipal_admin: 'County-level management and oversight.',
  executive: 'Strategic oversight and sustainability metrics.',
  super_admin: 'Full platform governance and control.',
};

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { data: counties } = useCounties();
  const { data: subcounties } = useSubcounties(profile?.county_id);
  const { data: auditLogs } = useAuditLogs(50);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'permissions' | 'history'>('profile');
  const [permissions, setPermissions] = useState<string[]>([]);

  // Profile form
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    county_id: profile?.county_id || '',
    subcounty_id: profile?.subcounty_id || '',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    sms: false,
    push: true,
    report_updates: true,
    route_assignments: true,
    incident_alerts: true,
    system_updates: false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Login history
  const loginHistory = auditLogs
    .filter(log => log.user_id === user?.id && ['user_login', 'user_logout'].includes(log.action))
    .slice(0, 10);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        county_id: profile.county_id || '',
        subcounty_id: profile.subcounty_id || '',
      });
      if (profile.notification_preferences) {
        setNotifPrefs({
          email: profile.notification_preferences.email ?? true,
          sms: profile.notification_preferences.sms ?? false,
          push: profile.notification_preferences.push ?? true,
          report_updates: profile.notification_preferences.report_updates ?? true,
          route_assignments: profile.notification_preferences.route_assignments ?? true,
          incident_alerts: profile.notification_preferences.incident_alerts ?? true,
          system_updates: profile.notification_preferences.system_updates ?? false,
        });
      }
    }
    // Fetch permissions for current role
    fetchPermissions();
  }, [profile]);

  const fetchPermissions = async () => {
    const role = profile?.role || 'citizen';
    const { data } = await supabase
      .from('permission_templates')
      .select('permissions')
      .eq('role_name', role)
      .maybeSingle();
    if (data?.permissions) {
      setPermissions(data.permissions as string[]);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: passwordForm.currentPassword,
    });

    if (signInError) {
      setPasswordError('Current password is incorrect');
      setChangingPassword(false);
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (updateError) {
      setPasswordError(updateError.message);
    } else {
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: 'password_changed',
        entity_type: 'profiles',
        entity_id: user?.id || '',
        details: { changed_by_user: true },
      });
      await updateProfile({ password_change_required: false });
    }

    setChangingPassword(false);
  };

  const handleSaveNotifs = async () => {
    setSavingNotifs(true);
    await updateProfile({ notification_preferences: notifPrefs as any });
    setSavingNotifs(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'history', label: 'Login History', icon: History },
  ];

  const role = profile?.role || 'citizen';

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your profile, security, and preferences</p>
        </motion.div>

        {/* Password Change Required Alert */}
        {profile?.password_change_required && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-400">Password Change Required</div>
              <div className="text-xs text-amber-400/70">Please change your temporary password before continuing.</div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="glass-panel p-4">
              {/* User Card */}
              <div className="text-center mb-6 pb-4 border-b border-slate-700/50">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 border border-slate-700">
                  <User className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-50">{profile?.full_name || user?.email}</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-flex items-center px-3 py-1 mt-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                  <Shield className="w-3 h-3 mr-1" /> {roleLabels[role]}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={signOut}
                className="w-full mt-6 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-6"
                >
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" /> Profile Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Email (read-only)</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Role</label>
                      <div className="relative">
                        <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={roleLabels[role]}
                          disabled
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">County</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={form.county_id}
                          onChange={(e) => setForm({ ...form, county_id: e.target.value, subcounty_id: '' })}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        >
                          <option value="">Select County</option>
                          {counties.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Subcounty</label>
                      <select
                        value={form.subcounty_id}
                        onChange={(e) => setForm({ ...form, subcounty_id: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        disabled={!form.county_id}
                      >
                        <option value="">Select Subcounty</option>
                        {subcounties.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary disabled:opacity-50">
                      {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                    {saved && (
                      <span className="flex items-center gap-1 text-sm text-emerald-400">
                        <CheckCircle className="w-4 h-4" /> Saved
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-emerald-400" /> Change Password
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Current Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                          >
                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">New Password</label>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                            required
                            minLength={6}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Confirm New Password</label>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      {passwordError && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-400">
                          <AlertTriangle className="w-4 h-4" /> {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-sm text-emerald-400">
                          <CheckCircle className="w-4 h-4" /> Password changed successfully!
                        </div>
                      )}

                      <button type="submit" disabled={changingPassword} className="btn-primary disabled:opacity-50">
                        {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Key className="w-4 h-4" /> Change Password</>}
                      </button>
                    </form>
                  </div>

                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div>
                        <div className="text-sm font-medium text-slate-300">2FA Status</div>
                        <div className="text-xs text-slate-500">Add an extra layer of security to your account</div>
                      </div>
                      <button className="btn-secondary text-xs">Enable 2FA</button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app.</p>
                  </div>
                </motion.div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <motion.div
                  key="permissions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-6"
                >
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" /> Current Permissions
                  </h3>

                  <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        role === 'super_admin' ? 'bg-red-500/10' :
                        role === 'municipal_admin' ? 'bg-amber-500/10' :
                        role === 'executive' ? 'bg-teal-500/10' :
                        role === 'dispatcher' ? 'bg-violet-500/10' :
                        role === 'contractor' ? 'bg-blue-500/10' :
                        'bg-emerald-500/10'
                      }`}>
                        <Shield className={`w-5 h-5 ${
                          role === 'super_admin' ? 'text-red-400' :
                          role === 'municipal_admin' ? 'text-amber-400' :
                          role === 'executive' ? 'text-teal-400' :
                          role === 'dispatcher' ? 'text-violet-400' :
                          role === 'contractor' ? 'text-blue-400' :
                          'text-emerald-400'
                        }`} />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-50">{roleLabels[role]}</div>
                        <div className="text-xs text-slate-500">{roleDescriptions[role]}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-slate-400 mb-3">
                    Assigned Permissions ({permissions.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400"
                      >
                        {perm}
                      </span>
                    ))}
                    {permissions.length === 0 && (
                      <span className="text-sm text-slate-500">No specific permissions assigned.</span>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-blue-400">
                      <strong>Note:</strong> Permissions determine which pages and actions you can access in the platform.
                      {role === 'super_admin' && ' As Super Admin, you have access to all platform features.'}
                      {role !== 'super_admin' && ' Contact your administrator if you need additional permissions.'}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-6"
                >
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400" /> Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">Delivery Methods</h4>
                      <div className="space-y-2">
                        {[
                          { id: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                          { id: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                          { id: 'push', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                        ].map((pref) => (
                          <div key={pref.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <div>
                              <div className="text-sm text-slate-300">{pref.label}</div>
                              <div className="text-xs text-slate-500">{pref.desc}</div>
                            </div>
                            <button
                              onClick={() => setNotifPrefs({ ...notifPrefs, [pref.id]: !notifPrefs[pref.id as keyof typeof notifPrefs] })}
                              className={notifPrefs[pref.id as keyof typeof notifPrefs] ? 'text-emerald-400' : 'text-slate-500'}
                            >
                              {notifPrefs[pref.id as keyof typeof notifPrefs] ? (
                                <ToggleRight className="w-8 h-8" />
                              ) : (
                                <ToggleLeft className="w-8 h-8" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">Notification Types</h4>
                      <div className="space-y-2">
                        {[
                          { id: 'report_updates', label: 'Report Updates', desc: 'Status changes on your reports' },
                          { id: 'route_assignments', label: 'Route Assignments', desc: 'New route assignments and updates' },
                          { id: 'incident_alerts', label: 'Incident Alerts', desc: 'Critical incident notifications' },
                          { id: 'system_updates', label: 'System Updates', desc: 'Platform maintenance and updates' },
                        ].map((pref) => (
                          <div key={pref.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <div>
                              <div className="text-sm text-slate-300">{pref.label}</div>
                              <div className="text-xs text-slate-500">{pref.desc}</div>
                            </div>
                            <button
                              onClick={() => setNotifPrefs({ ...notifPrefs, [pref.id]: !notifPrefs[pref.id as keyof typeof notifPrefs] })}
                              className={notifPrefs[pref.id as keyof typeof notifPrefs] ? 'text-emerald-400' : 'text-slate-500'}
                            >
                              {notifPrefs[pref.id as keyof typeof notifPrefs] ? (
                                <ToggleRight className="w-8 h-8" />
                              ) : (
                                <ToggleLeft className="w-8 h-8" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleSaveNotifs} disabled={savingNotifs} className="btn-primary disabled:opacity-50">
                      {savingNotifs ? 'Saving...' : <><Save className="w-4 h-4" /> Save Preferences</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-6"
                >
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" /> Recent Login Activity
                  </h3>

                  <div className="space-y-2">
                    {loginHistory.length > 0 ? (
                      loginHistory.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            log.action === 'user_login' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                          }`}>
                            {log.action === 'user_login' ? (
                              <Monitor className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <LogOut className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-300 capitalize">
                              {log.action.replace('_', ' ')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {new Date(log.created_at).toLocaleString()}
                              {log.details?.ip_address && (
                                <>
                                  <Globe className="w-3 h-3 ml-2" />
                                  {log.details.ip_address}
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.action === 'user_login' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {log.action === 'user_login' ? 'Signed In' : 'Signed Out'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <History className="w-8 h-8 mx-auto mb-2" />
                        No login history available
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
