import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSettings } from '../hooks/useSwanData';
import { Settings, Bell, Shield, MapPin, Cpu, Save, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SystemSettings() {
  useAppSettings();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'gis', label: 'GIS', icon: MapPin },
    { id: 'ai', label: 'AI Agents', icon: Cpu },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">System Settings</h1>
          <p className="text-slate-400">Platform configuration and operational parameters</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 shrink-0">
            <div className="glass-panel p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                  {(() => {
                    const tab = tabs.find((t) => t.id === activeTab);
                    return tab ? <tab.icon className="w-5 h-5 text-emerald-400" /> : null;
                  })()}
                  {tabs.find((t) => t.id === activeTab)?.label} Settings
                </h2>
                <div className="flex items-center gap-2">
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> Saved
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </div>

              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Organization Name</label>
                      <input type="text" defaultValue="SmartWaste Africa Nexus" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Country</label>
                      <input type="text" defaultValue="Kenya" disabled className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Default County</label>
                      <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                        <option>Nairobi</option>
                        <option>Mombasa</option>
                        <option>Kisumu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Time Zone</label>
                      <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                        <option>Africa/Nairobi (EAT)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Platform Status</label>
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm text-emerald-400">Operational — All systems active</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { label: 'Email Alerts', desc: 'Send critical alerts via email', enabled: true },
                    { label: 'SMS Alerts', desc: 'Send urgent alerts via SMS', enabled: false },
                    { label: 'Push Notifications', desc: 'Browser push notifications', enabled: true },
                    { label: 'Overflow Alerts', desc: 'Alert when bin exceeds 80% capacity', enabled: true },
                    { label: 'Incident Alerts', desc: 'Alert on new incident reports', enabled: true },
                    { label: 'Maintenance Alerts', desc: 'Alert on scheduled maintenance', enabled: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <div>
                        <div className="text-sm text-slate-300">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                      <button
                        className={`w-10 h-5 rounded-full transition-colors relative ${item.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <div className="text-sm font-bold text-slate-50 mb-2">Session Management</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Session Timeout</span><span className="text-slate-50">30 minutes</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Max Login Attempts</span><span className="text-slate-50">5</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Password Policy</span><span className="text-slate-50">8+ chars, mixed case</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">2FA Required</span><span className="text-amber-400">Optional</span></div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <div className="text-sm font-bold text-slate-50 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Security Audit
                    </div>
                    <div className="text-xs text-slate-400">Last security scan: <span className="text-emerald-400">2 hours ago</span></div>
                    <div className="text-xs text-slate-400">Threat level: <span className="text-emerald-400">Nominal</span></div>
                    <div className="text-xs text-slate-400">Vulnerabilities: <span className="text-emerald-400">0 detected</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'gis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Default Map View</label>
                      <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                        <option>National</option>
                        <option>County</option>
                        <option>City</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Map Provider</label>
                      <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                        <option>Internal SVG</option>
                        <option>Mapbox</option>
                        <option>Google Maps</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-sm text-slate-300">Show Bin Layer</span>
                      <span className="text-xs text-emerald-400">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-sm text-slate-300">Show Fleet Layer</span>
                      <span className="text-xs text-emerald-400">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-sm text-slate-300">Show Heatmap</span>
                      <span className="text-xs text-emerald-400">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-sm text-slate-300">Show Incident Layer</span>
                      <span className="text-xs text-emerald-400">Enabled</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Scout Threshold (%)</label>
                      <input type="number" defaultValue={80} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Guardian Equity Floor</label>
                      <input type="number" defaultValue={85} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Hunter Fuel Target (%)</label>
                      <input type="number" defaultValue={30} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-2">Oracle Sensitivity</label>
                      <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                        <option>High</option>
                        <option selected>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <div className="text-sm font-bold text-slate-50 mb-2">Agent Status</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-400">Scout Agent</span><span className="text-emerald-400">Online — 94% confidence</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Guardian Agent</span><span className="text-emerald-400">Online — 98% compliance</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Hunter Agent</span><span className="text-emerald-400">Online — 88% efficiency</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Oracle Agent</span><span className="text-emerald-400">Online — 95% accuracy</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-400">Sentinel Agent</span><span className="text-emerald-400">Online — Nominal threat</span></div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
