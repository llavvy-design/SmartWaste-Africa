import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useSustainabilityMetrics } from '../hooks/useSwanData';
import { MapPin, ChevronDown, Leaf, Fuel, TrendingUp, TrendingDown, Activity, BarChart3, Users, Recycle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function Sustainability() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: metrics } = useSustainabilityMetrics(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [chartView, setChartView] = useState<'carbon' | 'fuel' | 'equity' | 'recycling'>('carbon');

  const county = selectedCounty;

  const carbonData = metrics.map(m => ({
    month: m.month,
    carbon: m.carbon_prevented_tons,
    target: m.carbon_prevented_tons * 1.2,
  }));

  const fuelData = metrics.map(m => ({
    month: m.month,
    saved: m.fuel_saved_liters,
    efficiency: m.fuel_efficiency_pct,
  }));

  const equityData = metrics.map(m => ({
    month: m.month,
    score: m.equity_score,
    coverage: m.service_coverage_pct,
  }));

  const radarData = [
    { metric: 'Carbon Reduction', baseline: 60, current: county ? county.carbon_saved_tons / 2 : 85 },
    { metric: 'Fuel Efficiency', baseline: 55, current: county ? county.fuel_saved_pct : 78 },
    { metric: 'Equity Score', baseline: 70, current: county ? county.equity_score : 92 },
    { metric: 'Coverage', baseline: 80, current: county ? county.coverage_pct : 96 },
    { metric: 'Recycling', baseline: 30, current: metrics.length ? metrics[0].recycling_rate_pct : 42 },
    { metric: 'Cost Reduction', baseline: 50, current: county ? county.fuel_saved_pct + 20 : 72 },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-50">Sustainability Analytics</h1>
            <div className="relative">
              <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">{selectedCounty?.name || 'National View'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              {showCountyDropdown && (
                <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  <button onClick={() => { setSelectedCounty(null); setShowCountyDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 border-b border-slate-700">National View</button>
                  {counties.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCounty(c); setShowCountyDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">{c.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-400">ESG tracking, carbon reduction analytics, and sustainability performance dashboards</p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Carbon Prevented', value: county ? `${county.carbon_saved_tons} MT` : `${metrics.reduce((s, m) => s + m.carbon_prevented_tons, 0).toFixed(1)} MT`, icon: Leaf, color: 'text-emerald-400', trend: 'up' },
            { label: 'Fuel Efficiency', value: county ? `${county.fuel_saved_pct}%` : `${metrics.reduce((s, m) => s + m.fuel_efficiency_pct, 0) / (metrics.length || 1)}%`, icon: Fuel, color: 'text-blue-400', trend: 'up' },
            { label: 'Equity Score', value: county ? `${county.equity_score}` : `${metrics.reduce((s, m) => s + m.equity_score, 0) / (metrics.length || 1)}`, icon: Users, color: 'text-violet-400', trend: 'up' },
            { label: 'Collection Eff.', value: `${metrics.reduce((s, m) => s + m.collection_efficiency_pct, 0) / (metrics.length || 1)}%`, icon: TrendingUp, color: 'text-amber-400', trend: 'up' },
            { label: 'Recycling Rate', value: `${metrics.reduce((s, m) => s + m.recycling_rate_pct, 0) / (metrics.length || 1)}%`, icon: Recycle, color: 'text-cyan-400', trend: 'up' },
            { label: 'Coverage', value: county ? `${county.coverage_pct}%` : `${metrics.reduce((s, m) => s + m.service_coverage_pct, 0) / (metrics.length || 1)}%`, icon: Activity, color: 'text-rose-400', trend: 'up' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-amber-400" />}
              </div>
              <div className="text-xl font-bold text-slate-50 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-50 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Performance Trends
              </h3>
              <div className="flex gap-2">
                {(['carbon', 'fuel', 'equity', 'recycling'] as const).map(v => (
                  <button key={v} onClick={() => setChartView(v)}
                    className={`px-2 py-1 rounded text-xs ${chartView === v ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'carbon' ? (
                  <AreaChart data={carbonData.length ? carbonData : [{ month: 'Jan', carbon: 0, target: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                    <Area type="monotone" dataKey="carbon" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="target" stroke="#64748B" fill="#64748B" fillOpacity={0.05} strokeWidth={1} strokeDasharray="5 5" />
                  </AreaChart>
                ) : chartView === 'fuel' ? (
                  <LineChart data={fuelData.length ? fuelData : [{ month: 'Jan', saved: 0, efficiency: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                    <Line type="monotone" dataKey="saved" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                ) : (
                  <BarChart data={equityData.length ? equityData : [{ month: 'Jan', score: 0, coverage: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                    <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coverage" fill="#334155" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> ESG Radar
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#334155" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Radar name="Baseline" dataKey="baseline" stroke="#64748B" fill="#64748B" fillOpacity={0.1} />
                  <Radar name="Current" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Detailed ESG Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" /> ESG Performance Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Environmental</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Carbon Reduction</span><span className="text-emerald-400 font-bold">{county ? county.carbon_saved_tons : 0} MT</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Fuel Saved</span><span className="text-emerald-400 font-bold">{metrics.reduce((s, m) => s + m.fuel_saved_liters, 0).toFixed(0)} L</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Waste Diverted</span><span className="text-emerald-400 font-bold">42.1%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Water Conserved</span><span className="text-emerald-400 font-bold">8.3M L</span></div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Social</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Equity Score</span><span className="text-violet-400 font-bold">{county ? county.equity_score : 88.4}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Jobs Created</span><span className="text-violet-400 font-bold">{county ? county.fleet_count * 2 + 124 : 0}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Citizen Satisfaction</span><span className="text-violet-400 font-bold">87.2%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Ward Coverage</span><span className="text-violet-400 font-bold">{county ? county.coverage_pct : 82.4}%</span></div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Governance</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Data Transparency</span><span className="text-blue-400 font-bold">99.8%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Compliance Score</span><span className="text-blue-400 font-bold">96.4%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Audit Frequency</span><span className="text-blue-400 font-bold">Monthly</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Risk Incidents</span><span className="text-blue-400 font-bold">{metrics.length}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
