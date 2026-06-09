import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Download, FileText, Calendar, MapPin, ChevronDown, Loader2,
  TrendingDown, Fuel, Leaf, Users, BarChart3, Zap, CheckCircle
} from 'lucide-react';

// Sustainability data
const carbonData = [
  { month: 'Jan', co2: 2.1, target: 2.5 },
  { month: 'Feb', co2: 2.3, target: 2.5 },
  { month: 'Mar', co2: 1.9, target: 2.5 },
  { month: 'Apr', co2: 1.8, target: 2.5 },
  { month: 'May', co2: 1.6, target: 2.5 },
  { month: 'Jun', co2: 1.4, target: 2.5 },
];

const fuelData = [
  { month: 'Jan', baseline: 100, optimized: 100 },
  { month: 'Feb', baseline: 102, optimized: 96 },
  { month: 'Mar', baseline: 105, optimized: 92 },
  { month: 'Apr', baseline: 108, optimized: 89 },
  { month: 'May', baseline: 110, optimized: 85 },
  { month: 'Jun', baseline: 112, optimized: 82 },
];

const equityData = [
  { district: 'CBD', score: 94, target: 90 },
  { district: 'Westlands', score: 88, target: 90 },
  { district: 'Kibera', score: 96, target: 90 },
  { district: 'Karen', score: 91, target: 90 },
  { district: 'Eastleigh', score: 87, target: 90 },
  { district: 'Kisumu', score: 93, target: 90 },
  { district: 'Mombasa', score: 89, target: 90 },
  { district: 'Nakuru', score: 92, target: 90 },
];

const wasteComposition = [
  { name: 'Organic', value: 42, color: '#10B981' },
  { name: 'Plastic', value: 23, color: '#3B82F6' },
  { name: 'Paper', value: 18, color: '#F59E0B' },
  { name: 'Metal', value: 8, color: '#EF4444' },
  { name: 'Glass', value: 5, color: '#8B5CF6' },
  { name: 'Other', value: 4, color: '#6B7280' },
];

const radarData = [
  { metric: 'Carbon Reduction', baseline: 60, current: 85 },
  { metric: 'Fuel Efficiency', baseline: 55, current: 78 },
  { metric: 'Equity Score', baseline: 70, current: 92 },
  { metric: 'Coverage', baseline: 80, current: 96 },
  { metric: 'Response Time', baseline: 65, current: 88 },
  { metric: 'Cost Reduction', baseline: 50, current: 72 },
];

const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'];
const reportTypes = ['Executive Summary', 'Sustainability Audit', 'Fleet Performance', 'Equity Impact Report', 'Full Municipal Analytics'];

interface ReportConfig {
  city: string;
  dateRange: string;
  reportType: string;
}

export default function Analytics() {
  const [config, setConfig] = useState<ReportConfig>({
    city: 'Nairobi',
    dateRange: 'Last 30 Days',
    reportType: 'Executive Summary',
  });

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setProgress(0);
  };

  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setGenerating(false);
            setGenerated(true);
            return 100;
          }
          return p + Math.random() * 15 + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [generating]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Sustainability Impact & BI Reporting Vault</h1>
          <p className="text-slate-400">Business intelligence workspace for municipal sustainability analytics and executive reporting</p>
        </motion.div>

        {/* Sustainability Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Carbon Reduction (MT)', value: '14.8', change: '-12.3%', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Fuel Efficiency Gain', value: '27.4%', change: '+8.1%', icon: Fuel, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Equity Score Average', value: '91.2', change: '+4.7%', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { label: 'Coverage Uptime', value: '98.4%', change: '+1.2%', icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} border border-slate-700/50 rounded-xl p-6`}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-50 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Carbon Reduction Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              Carbon Emissions Reduction
            </h3>
            <p className="text-xs text-slate-500 mb-6">Monthly CO2 prevented (metric tons) vs municipal targets</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="target" stroke="#64748B" fill="#64748B" fillOpacity={0.05} strokeWidth={1} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Fuel Efficiency Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-blue-400" />
              Fleet Fuel Efficiency
            </h3>
            <p className="text-xs text-slate-500 mb-6">Baseline vs optimized fuel consumption index (100 = baseline)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Line type="monotone" dataKey="baseline" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="optimized" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Equity Metrics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Neighborhood Equity Metrics
            </h3>
            <p className="text-xs text-slate-500 mb-6">Equity score by district vs target threshold (90%)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="district" stroke="#64748B" fontSize={11} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar + Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Performance Overview
            </h3>
            <p className="text-xs text-slate-500 mb-6">Baseline vs current performance across key metrics</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#334155" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Radar name="Baseline" dataKey="baseline" stroke="#64748B" fill="#64748B" fillOpacity={0.1} />
                  <Radar name="Current" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Waste Composition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-slate-50 mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Waste Composition Analysis
          </h3>
          <p className="text-xs text-slate-500 mb-6">Distribution by material type across all monitored zones</p>
          <div className="flex items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {wasteComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 flex-1">
              {wasteComposition.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-sm font-medium text-slate-50">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Report Generator Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-6"
        >
          <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            AI Report Generator Control Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* City Selector */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Target City</label>
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2 hover:border-slate-600 transition-colors"
              >
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{config.city}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
              </button>
              <AnimatePresence>
                {showCityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setConfig({ ...config, city }); setShowCityDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Range Selector */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2 hover:border-slate-600 transition-colors"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{config.dateRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
              </button>
              <AnimatePresence>
                {showDateDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months', 'Custom Range'].map((range) => (
                      <button
                        key={range}
                        onClick={() => { setConfig({ ...config, dateRange: range }); setShowDateDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {range}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Report Type Selector */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Report Type</label>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2 hover:border-slate-600 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>{config.reportType}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
              </button>
              <AnimatePresence>
                {showTypeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    {reportTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => { setConfig({ ...config, reportType: type }); setShowTypeDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling Executive Report... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate & Compile Executive PDF Audit
              </>
            )}
          </button>

          {/* Progress Bar */}
          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>Initializing query engine...</span>
                  <span>Rendering vector charts...</span>
                  <span>Compiling PDF...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Report Preview */}
          <AnimatePresence>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 glass-panel-strong p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-50">Report Generated Successfully</h3>
                      <p className="text-xs text-slate-500">{config.reportType} — {config.city} — {config.dateRange}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">SWAN-2024-{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}</span>
                    <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg border border-slate-700/50 p-6 mb-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-50 mb-2">SmartWaste Africa Nexus</h2>
                    <p className="text-sm text-slate-400">{config.reportType} — {config.city} Metropolitan District</p>
                    <p className="text-xs text-slate-500 mt-1">Reporting Period: {config.dateRange}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/30">
                      <div className="text-2xl font-bold text-emerald-400">14.8 MT</div>
                      <div className="text-xs text-slate-500 mt-1">Carbon Prevented</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/30">
                      <div className="text-2xl font-bold text-blue-400">27.4%</div>
                      <div className="text-xs text-slate-500 mt-1">Fuel Efficiency</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/30">
                      <div className="text-2xl font-bold text-violet-400">91.2</div>
                      <div className="text-xs text-slate-500 mt-1">Equity Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Executive Summary:</strong> The {config.city} municipal waste management ecosystem processed {config.dateRange === 'Last 30 Days' ? '1,420' : '4,260'} sensor data points through the autonomous multi-agent command infrastructure. The Scout network maintained 94% uptime across all telemetry nodes, while the Hunter routing engine achieved a 27.4% fuel efficiency improvement over baseline operations.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Guardian Equity Analysis:</strong> The Ubuntu override system ensured equitable collection coverage across all 14 demographic zones, with Kibera district receiving priority dispatch scheduling. Zero equity violations were detected during the reporting period.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Oracle Predictive Performance:</strong> The AI forecasting model predicted 4 capacity spike events with 95% accuracy. All predicted overflows were prevented through proactive fleet dispatch, resulting in zero environmental incidents.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Sentinel Security Audit:</strong> 3,847 telemetry entries were cryptographically verified. Two suspicious packets were quarantined and analyzed. No security breaches were detected. Blockchain integrity remains intact.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
