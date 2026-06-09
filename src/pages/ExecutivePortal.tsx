import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useSmartBins, useFleetVehicles, useSustainabilityMetrics, useCitizenReports } from '../hooks/useSwanData';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Truck, Leaf,
  BarChart3, Activity, Shield, Zap, MapPin, ChevronDown
} from 'lucide-react';

export default function ExecutivePortal() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: bins } = useSmartBins(selectedCounty?.id);
  const { data: fleet } = useFleetVehicles(selectedCounty?.id);
  const { data: sustainability } = useSustainabilityMetrics(selectedCounty?.id);
  const { data: reports } = useCitizenReports(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

  const county = selectedCounty;
  const activeBins = bins.filter(b => b.status === 'active').length;
  const criticalBins = bins.filter(b => b.fill_level_pct > 80).length;
  const activeFleet = fleet.filter(f => f.status === 'active').length;
  const availableFleet = fleet.filter(f => f.status === 'available').length;
  const openReports = reports.filter(r => r.status !== 'resolved').length;

  const latestSustainability = sustainability[0];

  const kpiCards = county ? [
    { label: 'Coverage', value: `${county.coverage_pct}%`, target: '90%', trend: county.coverage_pct > 90 ? 'up' : 'down', icon: Activity, color: 'text-emerald-400' },
    { label: 'Carbon Saved', value: `${county.carbon_saved_tons} MT`, target: '50 MT', trend: 'up', icon: Leaf, color: 'text-emerald-400' },
    { label: 'Fuel Saved', value: `${county.fuel_saved_pct}%`, target: '30%', trend: 'up', icon: Zap, color: 'text-blue-400' },
    { label: 'Equity Score', value: `${county.equity_score}`, target: '85', trend: county.equity_score > 85 ? 'up' : 'down', icon: Shield, color: 'text-violet-400' },
    { label: 'Smart Bins', value: `${county.smart_bins_count}`, target: '300', trend: 'up', icon: BarChart3, color: 'text-amber-400' },
    { label: 'Fleet Assets', value: `${county.fleet_count}`, target: '25', trend: 'up', icon: Truck, color: 'text-rose-400' },
  ] : [
    { label: 'Total Counties', value: `${counties.length}`, target: '', trend: 'up', icon: MapPin, color: 'text-emerald-400' },
    { label: 'Total Bins', value: `${bins.length}`, target: '', trend: 'up', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Total Fleet', value: `${fleet.length}`, target: '', trend: 'up', icon: Truck, color: 'text-amber-400' },
    { label: 'Open Reports', value: `${openReports}`, target: '', trend: 'down', icon: Users, color: 'text-rose-400' },
    { label: 'Critical Bins', value: `${criticalBins}`, target: '', trend: 'down', icon: Shield, color: 'text-red-400' },
    { label: 'Active Fleet', value: `${activeFleet}`, target: '', trend: 'up', icon: Activity, color: 'text-violet-400' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-50">Municipal Executive Portal</h1>
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
          <p className="text-slate-400">Executive-level analytics for county performance, budget efficiency, and operational KPIs</p>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {kpiCards.map((kpi, index) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-amber-400" />}
              </div>
              <div className={`text-xl font-bold text-slate-50 mb-1`}>{kpi.value}</div>
              <div className="text-xs text-slate-500">{kpi.label}</div>
              {kpi.target && (
                <div className="text-xs text-slate-600 mt-1">Target: {kpi.target}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Operational Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Operational Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Active Smart Bins</span>
                <span className="text-slate-50 font-bold">{activeBins}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Critical Overflow Risk</span>
                <span className="text-red-400 font-bold">{criticalBins}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Fleet Active</span>
                <span className="text-emerald-400 font-bold">{activeFleet}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Fleet Available</span>
                <span className="text-blue-400 font-bold">{availableFleet}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Open Reports</span>
                <span className="text-amber-400 font-bold">{openReports}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Sensor Health</span>
                <span className="text-emerald-400 font-bold">{bins.filter(b => b.sensor_health === 'healthy').length}/{bins.length}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" /> Sustainability KPIs
            </h3>
            {latestSustainability ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Carbon Prevented</span>
                  <span className="text-emerald-400 font-bold">{latestSustainability.carbon_prevented_tons} MT</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Fuel Saved</span>
                  <span className="text-blue-400 font-bold">{latestSustainability.fuel_saved_liters} L</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Fuel Efficiency</span>
                  <span className="text-violet-400 font-bold">{latestSustainability.fuel_efficiency_pct}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Collection Efficiency</span>
                  <span className="text-amber-400 font-bold">{latestSustainability.collection_efficiency_pct}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Equity Score</span>
                  <span className="text-rose-400 font-bold">{latestSustainability.equity_score}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <span className="text-slate-400">Recycling Rate</span>
                  <span className="text-emerald-400 font-bold">{latestSustainability.recycling_rate_pct}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Leaf className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No sustainability data available for this county</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Budget Efficiency
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Operational Cost / Bin</span>
                <span className="text-slate-50 font-bold">KES 2,340</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Fuel Cost Savings</span>
                <span className="text-emerald-400 font-bold">KES 1.2M</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Labor Efficiency</span>
                <span className="text-blue-400 font-bold">87.3%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Route Optimization</span>
                <span className="text-violet-400 font-bold">92.1%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">ROI (YTD)</span>
                <span className="text-amber-400 font-bold">+34.2%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <span className="text-slate-400">Budget Utilization</span>
                <span className="text-rose-400 font-bold">78.4%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ESG Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
          <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> ESG Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Environmental</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Carbon Reduction</span><span className="text-emerald-400 font-bold">{county ? county.carbon_saved_tons : 0} MT</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Air Quality Impact</span><span className="text-emerald-400 font-bold">+18.4%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Waste Diversion</span><span className="text-emerald-400 font-bold">42.1%</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Water Conservation</span><span className="text-emerald-400 font-bold">8.3M L</span></div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Social</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-400">Equity Score</span><span className="text-violet-400 font-bold">{county ? county.equity_score : 88.4}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400">Jobs Created</span><span className="text-violet-400 font-bold">{fleet.length * 2 + 124}</span></div>
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
                <div className="flex items-center justify-between"><span className="text-slate-400">Risk Incidents</span><span className="text-blue-400 font-bold">{openReports}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
