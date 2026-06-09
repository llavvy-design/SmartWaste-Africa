import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCounties } from '../hooks/useSwanData';
import {
  BarChart3, Leaf, TrendingUp, TrendingDown, MapPin,
  ArrowRight, Download, Activity, Target, DollarSign, Users
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: counties } = useCounties();
  const county = counties.find(c => c.id === profile?.county_id);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Executive Dashboard</h1>
              <p className="text-slate-400">Welcome back, {profile?.full_name || 'Executive'}. Strategic oversight and sustainability metrics.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-violet-500/10 text-violet-400 text-xs rounded-full border border-violet-500/20">
                <BarChart3 className="w-3 h-3 inline mr-1" /> Executive
              </span>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-2xl font-bold text-slate-50">{counties.length}</div>
            <div className="text-xs text-slate-500">Counties</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-2xl font-bold text-emerald-400">{county?.carbon_saved_tons || 0} MT</div>
            <div className="text-xs text-slate-500">Carbon Saved</div>
          </div>
          <div className="metric-card border-l-2 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-400">{county?.fuel_saved_pct || 0}%</div>
            <div className="text-xs text-slate-500">Fuel Saved</div>
          </div>
          <div className="metric-card border-l-2 border-l-violet-500">
            <div className="text-2xl font-bold text-violet-400">{county?.equity_score || 0}</div>
            <div className="text-xs text-slate-500">Equity Score</div>
          </div>
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-2xl font-bold text-amber-400">{county?.coverage_pct || 0}%</div>
            <div className="text-xs text-slate-500">Coverage</div>
          </div>
          <div className="metric-card border-l-2 border-l-rose-500">
            <div className="text-2xl font-bold text-rose-400">{county?.fleet_count || 0}</div>
            <div className="text-xs text-slate-500">Fleet</div>
          </div>
        </div>

        {/* Strategic Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" /> Executive Overview
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Operational Coverage</span>
                  <span className="text-emerald-400 font-bold">{county?.coverage_pct || 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${county?.coverage_pct || 0}%` }} />
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Collection Efficiency</span>
                  <span className="text-blue-400 font-bold">92.1%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '92.1%' }} />
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Citizen Satisfaction</span>
                  <span className="text-violet-400 font-bold">87.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: '87.2%' }} />
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">ROI (YTD)</span>
                  <span className="text-amber-400 font-bold">+34.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '34.2%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="glass-panel p-5">
              <h2 className="text-lg font-bold text-slate-50 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" /> Sustainability Metrics
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="text-lg font-bold text-emerald-400">{county?.carbon_saved_tons || 0} MT</div>
                  <div className="text-xs text-slate-500">Carbon Prevented</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="text-lg font-bold text-blue-400">{county?.fuel_saved_pct || 0}%</div>
                  <div className="text-xs text-slate-500">Fuel Efficiency</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="text-lg font-bold text-violet-400">{county?.equity_score || 0}</div>
                  <div className="text-xs text-slate-500">Equity Score</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="text-lg font-bold text-amber-400">42.1%</div>
                  <div className="text-xs text-slate-500">Recycling Rate</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h2 className="text-lg font-bold text-slate-50 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Budget & ROI
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operational Cost / Bin</span>
                  <span className="text-slate-50 font-bold">KES 2,340</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fuel Savings</span>
                  <span className="text-emerald-400 font-bold">KES 1.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Labor Efficiency</span>
                  <span className="text-blue-400 font-bold">87.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Budget Utilization</span>
                  <span className="text-amber-400 font-bold">78.4%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => navigate('/digital-twin')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <MapPin className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">Digital Twin</div>
            <div className="text-xs text-slate-500">National operations view</div>
          </button>
          <button onClick={() => navigate('/sustainability')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <Leaf className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">Sustainability</div>
            <div className="text-xs text-slate-500">ESG analytics & reports</div>
          </button>
          <button onClick={() => navigate('/reports')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <BarChart3 className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">Reports</div>
            <div className="text-xs text-slate-500">Generate executive reports</div>
          </button>
          <button onClick={() => navigate('/executive')} className="glass-panel p-4 text-left hover:border-emerald-500/30 transition-all">
            <Activity className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-slate-50">KPI Dashboard</div>
            <div className="text-xs text-slate-500">Detailed performance metrics</div>
          </button>
        </div>
      </div>
    </div>
  );
}
