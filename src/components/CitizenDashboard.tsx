import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCitizenReports } from '../hooks/useSwanData';
import {
  MessageSquare, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Trash2, Car, Shield, Recycle, BookOpen, ArrowRight, Bell
} from 'lucide-react';

const statusColors: Record<string, string> = {
  submitted: 'text-amber-400',
  under_review: 'text-blue-400',
  assigned: 'text-violet-400',
  in_progress: 'text-amber-400',
  resolved: 'text-emerald-400',
};

const reportTypes = [
  { id: 'overflow', label: 'Overflowing Bin', icon: Trash2, color: 'text-emerald-400' },
  { id: 'pickup', label: 'Request Pickup', icon: Car, color: 'text-blue-400' },
  { id: 'illegal_dumping', label: 'Illegal Dumping', icon: AlertTriangle, color: 'text-red-400' },
  { id: 'hazardous', label: 'Hazardous Waste', icon: Shield, color: 'text-rose-400' },
  { id: 'maintenance', label: 'Maintenance', icon: Trash2, color: 'text-amber-400' },
];

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: reports } = useCitizenReports();
  const myReports = reports.filter(r => r.reported_by === profile?.id);

  const activeReports = myReports.filter(r => r.status !== 'resolved');
  const resolvedReports = myReports.filter(r => r.status === 'resolved');
  const pendingReports = myReports.filter(r => r.status === 'submitted' || r.status === 'under_review');

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Citizen Dashboard</h1>
              <p className="text-slate-400">Welcome back, {profile?.full_name || 'Citizen'}. Report issues and track your community.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                <Recycle className="w-3 h-3 inline mr-1" /> Active Citizen
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-2xl font-bold text-slate-50">{myReports.length}</div>
            <div className="text-xs text-slate-500">Total Reports</div>
          </div>
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-2xl font-bold text-amber-400">{pendingReports.length}</div>
            <div className="text-xs text-slate-500">Pending</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-400">{resolvedReports.length}</div>
            <div className="text-xs text-slate-500">Resolved</div>
          </div>
          <div className="metric-card border-l-2 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-400">{activeReports.length}</div>
            <div className="text-xs text-slate-500">Active</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> Submit a Report
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {reportTypes.map((type) => (
                <button key={type.id} onClick={() => navigate('/citizen')}
                  className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500/30 transition-colors text-center">
                  <type.icon className={`w-5 h-5 mx-auto mb-1 ${type.color}`} />
                  <span className="text-xs text-slate-400">{type.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/citizen')} className="w-full btn-primary flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> New Report <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Community Education
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-slate-300 font-medium">Waste Separation Guide</div>
                <div className="text-xs text-slate-500">Learn how to separate organic, plastic, and hazardous waste</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-slate-300 font-medium">Recycling Best Practices</div>
                <div className="text-xs text-slate-500">Tips for effective recycling in your neighborhood</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-slate-300 font-medium">Community Cleanup Events</div>
                <div className="text-xs text-slate-500">Upcoming cleanup events in your county</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Reports Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> My Reports Timeline
          </h2>
          <div className="space-y-3">
            {myReports.slice(0, 6).map((report) => (
              <div key={report.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.status === 'resolved' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                  {report.status === 'resolved' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Clock className="w-5 h-5 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-50">{report.ticket_id || report.id.slice(0, 8)}</span>
                    <span className={`text-xs font-medium capitalize ${statusColors[report.status] || 'text-slate-400'}`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{report.report_type?.replace('_', ' ')} — {report.town || report.subcounty || '—'} — {new Date(report.created_at).toLocaleString()}</div>
                </div>
                <button onClick={() => navigate('/citizen')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Track <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
            {myReports.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No reports submitted yet. Submit your first report to get started.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
