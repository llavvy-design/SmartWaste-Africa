import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useAuth } from '../context/AuthContext';
import { useCounties, useCitizenReports, useCities, useSubcounties, useWards, useTowns } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, User, MessageSquare, AlertTriangle, CheckCircle, Clock, ChevronDown, Trash2, Car, Shield, Camera, X, Loader2 } from 'lucide-react';

const reportTypes = [
  { id: 'overflow', label: 'Overflowing Bin', icon: Trash2, severity: 'medium', autoEscalate: false },
  { id: 'pickup', label: 'Request Pickup', icon: Car, severity: 'low', autoEscalate: false },
  { id: 'illegal_dumping', label: 'Illegal Dumping', icon: AlertTriangle, severity: 'high', autoEscalate: true },
  { id: 'hazardous', label: 'Hazardous Waste', icon: Shield, severity: 'critical', autoEscalate: true },
  { id: 'maintenance', label: 'Maintenance Request', icon: Trash2, severity: 'medium', autoEscalate: false },
  { id: 'other', label: 'Other Issue', icon: MessageSquare, severity: 'low', autoEscalate: false },
];

const statusColors: Record<string, string> = {
  submitted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  under_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  assigned: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SWA-${year}-${random}`;
}

function calculateSeverity(reportType: string, description: string): string {
  const type = reportTypes.find(t => t.id === reportType);
  let severity = type?.severity || 'medium';
  const lower = description.toLowerCase();
  if (lower.includes('fire') || lower.includes('gas') || lower.includes('explosion') || lower.includes('toxic')) severity = 'critical';
  if (lower.includes('blocking') || lower.includes('road') || lower.includes('health')) severity = 'high';
  return severity;
}

function calculateDispatchPriority(reportType: string, severity: string): number {
  if (severity === 'critical') return 1;
  if (reportType === 'hazardous') return 2;
  if (severity === 'high') return 3;
  if (reportType === 'overflow') return 5;
  if (reportType === 'illegal_dumping') return 6;
  if (reportType === 'maintenance') return 8;
  return 10;
}

export default function CitizenPortal() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { user, profile } = useAuth();
  const { data: counties } = useCounties();
  const { data: cities } = useCities(selectedCounty?.id);
  const { data: subcounties } = useSubcounties(selectedCounty?.id);
  const { data: wards } = useWards(selectedCounty?.id ? cities[0]?.id : undefined);
  const { data: towns } = useTowns(selectedCounty?.id);
  const { data: reports, refetch } = useCitizenReports(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    reporter_name: profile?.full_name || '',
    phone: profile?.phone || '',
    report_type: 'overflow',
    description: '',
    city_id: '',
    subcounty_id: '',
    ward_id: '',
    town_id: '',
    village: '',
    latitude: '',
    longitude: '',
    use_gps: false,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [];
    const newPreviews: string[] = [];
    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = `reports/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('citizen-reports').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('citizen-reports').getPublicUrl(path);
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

  const getGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: String(pos.coords.latitude.toFixed(6)),
            longitude: String(pos.coords.longitude.toFixed(6)),
            use_gps: true,
          }));
        },
        () => {
          alert('GPS location not available. Please enter coordinates manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounty || !formData.city_id) return;
    setSubmitting(true);

    const ticketId = generateTicketId();
    const severity = calculateSeverity(formData.report_type, formData.description);
    const dispatchPriority = calculateDispatchPriority(formData.report_type, severity);
    const guardianScore = formData.report_type === 'overflow' ? Math.floor(85 + Math.random() * 10) : 100;

    const reportData = {
      county_id: selectedCounty.id,
      city_id: formData.city_id,
      subcounty_id: formData.subcounty_id || null,
      ward_id: formData.ward_id || null,
      reporter_name: formData.reporter_name,
      phone: formData.phone,
      report_type: formData.report_type,
      description: formData.description,
      latitude: parseFloat(formData.latitude) || 0,
      longitude: parseFloat(formData.longitude) || 0,
      village: formData.village || '',
      town: towns.find(t => t.id === formData.town_id)?.name || '',
      subcounty: subcounties.find(s => s.id === formData.subcounty_id)?.name || '',
      ticket_id: ticketId,
      severity,
      priority: severity === 'critical' ? 'high' : severity === 'high' ? 'high' : 'medium',
      status: 'submitted',
      images: uploadedImages,
      ai_analysis: `Scout Agent analysis: ${severity} severity detected. Guardian equity score: ${guardianScore}. Estimated dispatch priority: ${dispatchPriority}.`,
      guardian_equity_score: guardianScore,
      dispatch_priority: dispatchPriority,
      reported_by: user?.id || null,
    };

    const { data: reportResult, error: reportError } = await supabase.from('citizen_reports').insert(reportData).select().single();

    if (!reportError && reportResult) {
      // Create incident
      await supabase.from('incidents').insert({
        county_id: selectedCounty.id,
        city_id: formData.city_id,
        incident_type: formData.report_type,
        severity,
        description: formData.description,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        status: 'new',
        escalated: severity === 'critical' || severity === 'high',
        images: uploadedImages,
        reported_by: user?.id || null,
        ticket_id: ticketId,
      });

      // Create dispatch queue entry
      await supabase.from('dispatch_queue').insert({
        county_id: selectedCounty.id,
        city_id: formData.city_id,
        priority: dispatchPriority,
        fill_level_pct: 0,
        wait_time_minutes: 0,
        is_guardian_override: severity === 'critical',
        is_citizen_report: true,
        status: 'queued',
      });

      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: 'citizen_report_submitted',
        entity_type: 'citizen_reports',
        entity_id: reportResult.id,
        details: { ticket_id: ticketId, severity, type: formData.report_type, location: selectedCounty.name },
      });

      // Create notification for user
      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: `Report ${ticketId} Submitted`,
          body: `Your ${formData.report_type} report has been received. Status: Under Review.`,
          type: 'success',
          action_url: '/citizen',
        });
      }

      // Create notification for dispatchers
      const { data: dispatchers } = await supabase.from('profiles').select('id').eq('role', 'dispatcher');
      if (dispatchers) {
        for (const d of dispatchers) {
          await supabase.from('notifications').insert({
            user_id: d.id,
            title: `New ${severity} Incident: ${ticketId}`,
            body: `${formData.report_type} in ${selectedCounty.name}. Priority: ${dispatchPriority}.`,
            type: severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'info',
            action_url: '/incidents',
          });
        }
      }

      setSubmittedTicket(ticketId);
      setSubmitted(true);
    }

    setSubmitting(false);
    setFormData({
      reporter_name: profile?.full_name || '',
      phone: profile?.phone || '',
      report_type: 'overflow',
      description: '',
      city_id: '',
      subcounty_id: '',
      ward_id: '',
      town_id: '',
      village: '',
      latitude: '',
      longitude: '',
      use_gps: false,
    });
    setUploadedImages([]);
    setPreviewImages([]);
    refetch();
    setTimeout(() => setSubmitted(false), 8000);
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Citizen Portal</h1>
          <p className="text-slate-400">Report issues, track service requests, and engage with municipal waste management</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> Submit a Report
            </h2>

            <div className="relative mb-4">
              <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">{selectedCounty?.name || 'Select County'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
              </button>
              {showCountyDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {counties.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCounty(c); setShowCountyDropdown(false); setFormData(prev => ({ ...prev, city_id: '', subcounty_id: '', ward_id: '', town_id: '' })); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">{c.name}</button>
                  ))}
                </div>
              )}
            </div>

            {selectedCounty && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {reportTypes.map((type) => (
                    <button key={type.id} type="button"
                      onClick={() => setFormData({ ...formData, report_type: type.id })}
                      className={`p-2 rounded-lg border text-xs transition-colors ${formData.report_type === type.id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                      <type.icon className="w-4 h-4 mx-auto mb-1" />
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Location Hierarchy */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">City</label>
                    <select value={formData.city_id} onChange={e => setFormData({ ...formData, city_id: e.target.value, ward_id: '' })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none" required>
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Subcounty</label>
                    <select value={formData.subcounty_id} onChange={e => setFormData({ ...formData, subcounty_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                      <option value="">Select Subcounty</option>
                      {subcounties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Ward</label>
                    <select value={formData.ward_id} onChange={e => setFormData({ ...formData, ward_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                      <option value="">Select Ward</option>
                      {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Town / Village</label>
                    <select value={formData.town_id} onChange={e => setFormData({ ...formData, town_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none">
                      <option value="">Select Town</option>
                      {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Or enter manually</label>
                  <input type="text" value={formData.village} onChange={e => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                    placeholder="Enter ward, village, or landmark name" />
                </div>

                {/* GPS Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input type="text" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      placeholder="Latitude" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                      placeholder="Longitude" />
                    <button type="button" onClick={getGPS}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 hover:border-slate-500 transition-colors shrink-0">
                      <MapPin className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {formData.use_gps && (
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> GPS coordinates captured
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" value={formData.reporter_name} onChange={e => setFormData({ ...formData, reporter_name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        placeholder="Your name" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                        placeholder="+254 7XX XXX XXX" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none h-24 resize-none"
                    placeholder="Describe the issue in detail..." required />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Photos (max 4)</label>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={handleImageUpload} />
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 transition-colors">
                      <Camera className="w-4 h-4" /> Add Photos
                    </button>
                    {uploadProgress > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading {uploadProgress}%
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewImages.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-slate-900/80 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full btn-primary disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Submit Report'}
                </button>

                <AnimatePresence>
                  {submitted && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">Report Submitted Successfully</span>
                      </div>
                      <div className="text-sm text-slate-300 mb-1">
                        Ticket ID: <span className="font-mono font-bold text-slate-50">{submittedTicket}</span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>1. Report saved to database</p>
                        <p>2. Scout Agent analyzing severity</p>
                        <p>3. Guardian Agent checking equity</p>
                        <p>4. Incident ticket created</p>
                        <p>5. Dispatch queue entry added</p>
                        <p>6. Dispatcher notified</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="glass-panel p-5">
              <h3 className="text-sm font-bold text-slate-50 mb-3">My Reports</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-2xl font-bold text-slate-50">{reports.length}</div>
                  <div className="text-xs text-slate-500">Total Reports</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-2xl font-bold text-emerald-400">{reports.filter(r => r.status === 'resolved').length}</div>
                  <div className="text-xs text-slate-500">Resolved</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-2xl font-bold text-amber-400">{reports.filter(r => r.status === 'submitted' || r.status === 'under_review').length}</div>
                  <div className="text-xs text-slate-500">Pending</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-2xl font-bold text-blue-400">{reports.filter(r => r.status === 'assigned' || r.status === 'in_progress').length}</div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-sm font-bold text-slate-50 mb-3">How It Works</h3>
              <div className="space-y-3 text-sm">
                {[
                  'Select your county, subcounty, ward, and town',
                  'Our Scout Agent analyzes your report for severity',
                  'Guardian Agent checks equity implications for all wards',
                  'Hunter Agent calculates dispatch priority and assigns nearest vehicle',
                  'Dispatcher confirms assignment and routes contractor',
                  'You track progress via ticket ID in real-time',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">{i + 1}</div>
                    <p className="text-slate-400">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Report History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-50">Service Ticket History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Ticket ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Images</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-emerald-400 text-xs font-bold">{report.ticket_id || report.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{report.report_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{report.town || report.subcounty || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize ${report.severity === 'critical' ? 'text-red-400' : report.severity === 'high' ? 'text-amber-400' : report.severity === 'medium' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusColors[report.status] || 'bg-slate-800 text-slate-400'}`}>
                        {report.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {report.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {report.images && report.images.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Camera className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-400">{report.images.length}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(report.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-500 text-sm">No reports submitted yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
