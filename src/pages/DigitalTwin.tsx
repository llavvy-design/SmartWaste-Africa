import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCounty } from '../context/CountyContext';
import { useCounties } from '../hooks/useSwanData';
import {
  MapPin, ArrowRight, Leaf,
  Truck, Trash2, Activity, Shield, Zap, Users, BarChart3
} from 'lucide-react';

const regionColors: Record<string, string> = {
  'Coast': '#10B981',
  'North Eastern': '#F59E0B',
  'Eastern': '#8B5CF6',
  'Central': '#3B82F6',
  'Rift Valley': '#EF4444',
  'Western': '#06B6D4',
  'Nyanza': '#EC4899',
  'Nairobi': '#10B981',
};

function RiskBadge({ score }: { score: number }) {
  if (score >= 90) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Risk</span>;
  if (score >= 75) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium Risk</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">High Risk</span>;
}

export default function DigitalTwin() {
  const navigate = useNavigate();
  const { setSelectedCounty } = useCounty();
  const { data: counties, loading } = useCounties();
  const [sortBy, setSortBy] = useState<'coverage' | 'carbon' | 'equity' | 'fuel'>('coverage');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedCounties = [...counties].sort((a, b) => {
    if (sortBy === 'coverage') return b.coverage_pct - a.coverage_pct;
    if (sortBy === 'carbon') return b.carbon_saved_tons - a.carbon_saved_tons;
    if (sortBy === 'equity') return b.equity_score - a.equity_score;
    return b.fuel_saved_pct - a.fuel_saved_pct;
  });

  const topCounties = sortedCounties.slice(0, 10);
  const totalBins = counties.reduce((s, c) => s + c.smart_bins_count, 0);
  const totalFleet = counties.reduce((s, c) => s + c.fleet_count, 0);
  const totalCarbon = counties.reduce((s, c) => s + c.carbon_saved_tons, 0);
  const avgCoverage = counties.length ? counties.reduce((s, c) => s + c.coverage_pct, 0) / counties.length : 0;

  const handleCountySelect = (county: typeof counties[0]) => {
    setSelectedCounty(county);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Digital Twin Kenya</h1>
          <p className="text-slate-400">National Operations Center — Live model of all 47 counties</p>
        </motion.div>

        {/* National Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Counties', value: counties.length, icon: MapPin, color: 'text-emerald-400' },
            { label: 'Smart Bins', value: totalBins, icon: Trash2, color: 'text-blue-400' },
            { label: 'Fleet Assets', value: totalFleet, icon: Truck, color: 'text-amber-400' },
            { label: 'Carbon Saved', value: `${totalCarbon.toFixed(0)} MT`, icon: Leaf, color: 'text-emerald-400' },
            { label: 'Avg Coverage', value: `${avgCoverage.toFixed(1)}%`, icon: Activity, color: 'text-violet-400' },
            { label: 'Population', value: `${(counties.reduce((s, c) => s + c.population, 0) / 1000000).toFixed(1)}M`, icon: Users, color: 'text-rose-400' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="metric-card">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-xl font-bold text-slate-50">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Region Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" /> County Performance Rankings
            </h2>
            <div className="flex items-center gap-2 mb-4">
              {(['coverage', 'carbon', 'equity', 'fuel'] as const).map(key => (
                <button key={key} onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === key ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
                  {key === 'coverage' ? 'Coverage' : key === 'carbon' ? 'Carbon' : key === 'equity' ? 'Equity' : 'Fuel'}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {sortedCounties.map((county, index) => (
                <div key={county.id} onClick={() => handleCountySelect(county)}
                  className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <div className="w-8 text-center text-sm font-bold text-slate-500">#{index + 1}</div>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: regionColors[county.region] || '#64748B' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-50">{county.name}</span>
                      <span className="text-xs text-slate-500">{county.region}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" /> {county.smart_bins_count} bins
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Truck className="w-3 h-3" /> {county.fleet_count} trucks
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-400">
                      {sortBy === 'coverage' ? `${county.coverage_pct}%` : sortBy === 'carbon' ? `${county.carbon_saved_tons} MT` : sortBy === 'equity' ? county.equity_score : `${county.fuel_saved_pct}%`}
                    </div>
                    <div className="text-xs text-slate-500">{sortBy === 'coverage' ? 'Coverage' : sortBy === 'carbon' ? 'Carbon' : sortBy === 'equity' ? 'Equity' : 'Fuel'}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Risk Overview
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <div>
                  <div className="text-sm font-bold text-slate-50">Low Risk</div>
                  <div className="text-xs text-slate-500">Counties with 85%+ coverage</div>
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {counties.filter(c => c.coverage_pct >= 85).length}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <div>
                  <div className="text-sm font-bold text-slate-50">Medium Risk</div>
                  <div className="text-xs text-slate-500">Counties with 70-85% coverage</div>
                </div>
                <div className="text-lg font-bold text-amber-400">
                  {counties.filter(c => c.coverage_pct >= 70 && c.coverage_pct < 85).length}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                <div>
                  <div className="text-sm font-bold text-slate-50">High Risk</div>
                  <div className="text-xs text-slate-500">Counties with below 70% coverage</div>
                </div>
                <div className="text-lg font-bold text-red-400">
                  {counties.filter(c => c.coverage_pct < 70).length}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-50 mb-3">Region Distribution</h3>
              <div className="space-y-2">
                {Object.entries(regionColors).map(([region, color]) => {
                  const count = counties.filter(c => c.region === region).length;
                  return (
                    <div key={region} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-slate-400">{region}</span>
                      </div>
                      <span className="text-slate-50 font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Counties Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" /> Top Performing Counties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {topCounties.map((county) => (
              <div key={county.id} onClick={() => handleCountySelect(county)}
                className="glass-panel p-4 hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-50">{county.name}</span>
                  <RiskBadge score={county.coverage_pct} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-500">Coverage: <span className="text-slate-50">{county.coverage_pct}%</span></div>
                  <div className="text-slate-500">Bins: <span className="text-slate-50">{county.smart_bins_count}</span></div>
                  <div className="text-slate-500">Carbon: <span className="text-slate-50">{county.carbon_saved_tons} MT</span></div>
                  <div className="text-slate-500">Equity: <span className="text-slate-50">{county.equity_score}</span></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
