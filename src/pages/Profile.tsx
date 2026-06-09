import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCounties, useCities } from '../hooks/useSwanData';
import { User, Mail, Phone, MapPin, Shield, Save, CheckCircle, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { data: counties } = useCounties();
  const { data: cities } = useCities(profile?.county_id || undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    county_id: profile?.county_id || '',
    city_id: profile?.city_id || '',
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[800px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Profile</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 glass-panel p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-50">{profile?.full_name || user?.email}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-flex items-center px-3 py-1 mt-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20 capitalize">
                <Shield className="w-3 h-3 mr-1" /> {profile?.role || 'Citizen'}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" /> {user?.email}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4" /> {profile?.phone || 'Not set'}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" /> {counties.find(c => c.id === profile?.county_id)?.name || 'Not set'}
              </div>
            </div>

            <button onClick={signOut} className="w-full mt-6 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>

          {/* Edit Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-50 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">County</label>
                <select
                  value={form.county_id}
                  onChange={e => setForm({ ...form, county_id: e.target.value, city_id: '' })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                >
                  <option value="">Select County</option>
                  {counties.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">City</label>
                <select
                  value={form.city_id}
                  onChange={e => setForm({ ...form, city_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
                {saved && (
                  <span className="flex items-center gap-1 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Saved
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
