import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useAuth } from '../context/AuthContext';
import { useCounties, useIncidents, useCities } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Shield, MapPin, ChevronDown, Clock, CheckCircle, Wrench, AlertCircle, Camera, X } from 'lucide-react';
import type { Incident } from '../types';

const severityConfig = {
  low: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  medium: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

const incidentTypeIcons: Record<string, typeof AlertTriangle> = {
  overflow: AlertTriangle,
  illegal_dumping: AlertCircle,
  hazardous: Shield,
  fire: Wrench,
  flood: AlertTriangle,
  other: AlertCircle,
  maintenance: Wrench,
  pickup: MapPin,
};

export default function IncidentCenter() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { user } = useAuth();
  const { data: counties } = useCounties();
  const { data: cities } = useCities(selectedCounty?.id);
  const { data: incidents, refetch } = useIncidents(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'assigned' | 'investigating' | 'resolved'>('all');
  const [formData, setFormData] = useState({
    incident_type: 'overflow', severity: 'medium', description: '', city_id: '', latitude: '', longitude: '',
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null);

  const filtered = incidents.filter(i => {
    if (filter === 'new') return i.status === 'new';
    if (filter === 'assigned') return i.status === 'assigned';
    if (filter === 'investigating') return i.status === 'investigating';
    if (filter === 'resolved') return i.status === 'resolved';
    return true;
  });

  const newCount = incidents.filter(i => i.status === 'new').length;
  const assignedCount = incidents.filter(i => i.status === 'assigned').length;
  const investigatingCount = incidents.filter(i => i.status === 'investigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  const highRiskCount = incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [];
    const newPreviews: string[] = [];
    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = `incidents/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('incidents').upload(path, file, { cacheControl: '3600', upsert: false });
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('incidents').getPublicUrl(path);
        newImages.push(urlData.publicUrl);
        newPreviews.push(URL.createObjectURL(file));
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }
    setUploadedImages(prev => [...prev, ...newImages]);
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setUploadProgress(0);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounty || !formData.city_id) return;
    const { data: incidentResult, error } = await supabase.from('incidents').insert({
      county_id: selectedCounty.id, city_id: formData.city_id,
      incident_type: formData.incident_type, severity: formData.severity,
      description: formData.description, latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0, status: 'new', escalated: false,
      images: uploadedImages, reported_by: user?.id || null,
    }).select().single();
    if (!error && incidentResult) {
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null, action: 'incident_created', entity_type: 'incidents', entity_id: incidentResult.id,
        details: { type: formData.incident_type, severity: formData.severity, county: selectedCounty.name },
      });
      await supabase.from('dispatch_queue').insert({
        county_id: selectedCounty.id, city_id: formData.city_id,
        priority: formData.severity === 'critical' ? 1 : formData.severity === 'high' ? 3 : 5,
        fill_level_pct: 0, wait_time_minutes: 0, is_guardian_override: formData.severity === 'critical',
        is_citizen_report: false, status: 'queued',
      });
    }
    setFormData({ incident_type: 'overflow', severity: 'medium', description: '', city_id: '', latitude: '', longitude: '' });
    setUploadedImages([]); setPreviewImages([]);
    setShowForm(false);
    refetch();
  };

  const handleAssign = async (incidentId: string, assignTo: string) => {
    await supabase.from('incidents').update({ status: 'assigned', assigned_to: assignTo }).eq('id', incidentId);
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null, action: 'incident_assigned', entity_type: 'incidents', entity_id: incidentId,
      details: { assigned_to: assignTo },
    });
    setAssignModal(null);
    refetch();
  };

  const handleInvestigate = async (incident: Incident) => {
    await supabase.from('incidents').update({ status: 'investigating' }).eq('id', incident.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null, action: 'incident_investigating', entity_type: 'incidents', entity_id: incident.id,
    });
    refetch();
  };

  const handleEscalate = async (incident: Incident) => {
    await supabase.from('incidents').update({ escalated: true }).eq('id', incident.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null, action: 'incident_escalated', entity_type: 'incidents', entity_id: incident.id,
    });
    refetch();
  };

  const handleResolve = async (incident: Incident) => {
    await supabase.from('incidents').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', incident.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null, action: 'incident_resolved', entity_type: 'incidents', entity_id: incident.id,
    });
    refetch();
  };

  const statusFlow = (status: string) => {
    const flow = ['new', 'assigned', 'investigating', 'resolved'];
    return flow.indexOf(status);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Incident Command Center</h1>
          <p className="text-slate-400">Environmental emergency tracking, escalation, and resolution workflows</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative">
            <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">{selectedCounty?.name || 'All Counties'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {showCountyDropdown && (
              <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                <button onClick={() => { setSelectedCounty(null); setShowCountyDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 border-b border-slate-700">All Counties</button>
                {counties.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCounty(c); setShowCountyDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">{c.name}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            {showForm ? 'Cancel' : '+ New Incident'}
          </button>
          <div className="flex gap-2 ml-auto">
            {(['all', 'new', 'assigned', 'investigating', 'resolved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${filter === f ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-xs text-slate-500 mb-1">New</div>
            <div className="text-2xl font-bold text-amber-400">{newCount}</div>
          </div>
          <div className="metric-card border-l-2 border-l-blue-500">
            <div className="text-xs text-slate-500 mb-1">Assigned</div>
            <div className="text-2xl font-bold text-blue-400">{assignedCount}</div>
          </div>
          <div className="metric-card border-l-2 border-l-violet-500">
            <div className="text-xs text-slate-500 mb-1">Investigating</div>
            <div className="text-2xl font-bold text-violet-400">{investigatingCount}</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-xs text-slate-500 mb-1">Resolved</div>
            <div className="text-2xl font-bold text-emerald-400">{resolvedCount}</div>
          </div>
          <div className="metric-card border-l-2 border-l-rose-500">
            <div className="text-xs text-slate-500 mb-1">High Risk</div>
            <div className="text-2xl font-bold text-rose-400">{highRiskCount}</div>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-6 mb-6 overflow-hidden">
              <h3 className="text-sm font-bold text-slate-50 mb-4">Log New Incident</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select value={formData.incident_type} onChange={e => setFormData({ ...formData, incident_type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                      {Object.keys(incidentTypeIcons).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Severity</label>
                    <select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">City</label>
                    <select value={formData.city_id} onChange={e => setFormData({ ...formData, city_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300" required>
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 h-20 resize-none"
                    placeholder="Describe the incident..." required />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Photos</label>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 transition-colors">
                      <Camera className="w-4 h-4" /> Add Photos
                    </button>
                    {uploadProgress > 0 && <span className="text-xs text-slate-500">Uploading {uploadProgress}%</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewImages.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-slate-900/80 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" placeholder="Latitude" />
                  <input type="text" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" placeholder="Longitude" />
                </div>
                <button type="submit" className="btn-primary">Log Incident</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((incident, index) => {
            const Icon = incidentTypeIcons[incident.incident_type] || AlertTriangle;
            const severity = severityConfig[incident.severity as keyof typeof severityConfig] || severityConfig.medium;
            const flowIndex = statusFlow(incident.status);
            return (
              <motion.div key={incident.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className={`glass-panel p-5 border-l-4 ${incident.severity === 'critical' ? 'border-l-rose-500' : incident.severity === 'high' ? 'border-l-red-500' : incident.severity === 'medium' ? 'border-l-orange-500' : 'border-l-amber-500'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${severity.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${severity.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-50 capitalize">{incident.incident_type.replace('_', ' ')}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${severity.bg} ${severity.color} ${severity.border}`}>
                        {incident.severity}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${incident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {incident.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {['new', 'assigned', 'investigating', 'resolved'].map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${i <= flowIndex ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      {i < 3 && <div className={`w-4 h-0.5 ${i < flowIndex ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-slate-400 mb-3">{incident.description || 'No description provided'}</p>

                {incident.images && incident.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {incident.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} alt={`Incident ${i + 1}`} className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                    ))}
                    {incident.images.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500">+{incident.images.length - 3}</div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Clock className="w-3 h-3" /> {new Date(incident.created_at).toLocaleString()}
                </div>

                {incident.escalated && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded border border-red-500/20 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Escalated — Executive review required</span>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {incident.status === 'new' && (
                    <>
                      <button onClick={() => setAssignModal(incident.id)}
                        className="flex-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">Assign</button>
                      {!incident.escalated && (
                        <button onClick={() => handleEscalate(incident)}
                          className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 hover:bg-amber-500/20 transition-colors">Escalate</button>
                      )}
                    </>
                  )}
                  {incident.status === 'assigned' && (
                    <button onClick={() => handleInvestigate(incident)}
                      className="flex-1 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-400 hover:bg-violet-500/20 transition-colors">Start Investigation</button>
                  )}
                  {incident.status === 'investigating' && (
                    <button onClick={() => handleResolve(incident)}
                      className="flex-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                  {incident.status === 'resolved' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> Resolved {incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'N/A'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {assignModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel-strong p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-50 mb-4">Assign Incident</h3>
                <div className="space-y-2 mb-4">
                  <button onClick={() => handleAssign(assignModal, 'dispatcher-team-1')}
                    className="w-full text-left p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors text-sm text-slate-300">
                    <span className="font-bold text-slate-50">Dispatcher Team Alpha</span>
                    <span className="text-xs text-slate-500 ml-2">3 active members</span>
                  </button>
                  <button onClick={() => handleAssign(assignModal, 'dispatcher-team-2')}
                    className="w-full text-left p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors text-sm text-slate-300">
                    <span className="font-bold text-slate-50">Dispatcher Team Beta</span>
                    <span className="text-xs text-slate-500 ml-2">2 active members</span>
                  </button>
                  <button onClick={() => handleAssign(assignModal, 'emergency-response')}
                    className="w-full text-left p-3 bg-red-500/10 rounded-lg border border-red-500/20 hover:border-red-500 transition-colors text-sm text-red-400">
                    <span className="font-bold">Emergency Response Unit</span>
                    <span className="text-xs text-slate-500 ml-2">Critical incidents only</span>
                  </button>
                </div>
                <button onClick={() => setAssignModal(null)} className="w-full btn-secondary">Cancel</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
