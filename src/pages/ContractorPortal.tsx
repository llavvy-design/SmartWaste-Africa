import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useContractors } from '../hooks/useSwanData';
import { Briefcase, MapPin, ChevronDown, Star } from 'lucide-react';

export default function ContractorPortal() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: contractors } = useContractors(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = contractors.filter(c => filterStatus === 'all' || c.status === filterStatus);

  const avgCompliance = contractors.length ? contractors.reduce((s, c) => s + c.compliance_score, 0) / contractors.length : 0;
  const avgOnTime = contractors.length ? contractors.reduce((s, c) => s + c.on_time_pct, 0) / contractors.length : 0;
  const totalRoutes = contractors.reduce((s, c) => s + c.routes_completed, 0);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Contractor Portal</h1>
          <p className="text-slate-400">Contractor performance, route assignments, and compliance tracking</p>
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
          <div className="flex gap-2 ml-auto">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${filterStatus === s ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-xs text-slate-500 mb-1">Contractors</div>
            <div className="text-2xl font-bold text-slate-50">{contractors.length}</div>
          </div>
          <div className="metric-card">
            <div className="text-xs text-slate-500 mb-1">Avg Compliance</div>
            <div className="text-2xl font-bold text-emerald-400">{avgCompliance.toFixed(1)}</div>
          </div>
          <div className="metric-card">
            <div className="text-xs text-slate-500 mb-1">Avg On-Time</div>
            <div className="text-2xl font-bold text-blue-400">{avgOnTime.toFixed(1)}%</div>
          </div>
          <div className="metric-card">
            <div className="text-xs text-slate-500 mb-1">Total Routes</div>
            <div className="text-2xl font-bold text-slate-50">{totalRoutes.toLocaleString()}</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contractor, index) => (
            <motion.div key={contractor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="glass-panel p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-50">{contractor.name}</h3>
                    <p className="text-xs text-slate-500">{contractor.contractor_id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${contractor.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {contractor.status}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Compliance Score</span>
                  <span className={`font-bold ${contractor.compliance_score > 80 ? 'text-emerald-400' : contractor.compliance_score > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {contractor.compliance_score}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${contractor.compliance_score > 80 ? 'bg-emerald-500' : contractor.compliance_score > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${contractor.compliance_score}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
                  <div className="text-sm font-bold text-slate-50">{contractor.routes_completed}</div>
                  <div className="text-[10px] text-slate-500">Routes</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
                  <div className="text-sm font-bold text-slate-50">{contractor.on_time_pct}%</div>
                  <div className="text-[10px] text-slate-500">On-Time</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
                  <div className="text-sm font-bold text-slate-50">{contractor.active_fleet_count}</div>
                  <div className="text-[10px] text-slate-500">Fleet</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-slate-500">License:</span>
                <span className="text-slate-300 font-mono">{contractor.license_number || 'N/A'}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
