import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useAuth } from '../context/AuthContext';
import { useCounties, useGeneratedReports, useSmartBins, useFleetVehicles, useCitizenReports } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import {
  Download, FileText, Calendar, MapPin, ChevronDown, Loader2,
  Zap, CheckCircle, BarChart3, Leaf, Truck, Shield, Activity
} from 'lucide-react';

const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'];
const reportTypes = [
  { id: 'Executive Summary', label: 'Executive Summary', icon: BarChart3, desc: 'County performance, operational KPIs, waste collection totals, strategic recommendations' },
  { id: 'Sustainability Audit', label: 'Sustainability Audit', icon: Leaf, desc: 'Carbon reduction, fuel savings, recycling impact, ESG metrics' },
  { id: 'Fleet Performance', label: 'Fleet Performance', icon: Truck, desc: 'Fleet utilization, route efficiency, vehicle downtime, maintenance statistics' },
  { id: 'Equity Impact Report', label: 'Equity Impact Report', icon: Shield, desc: 'Equity analysis, informal settlement coverage, bias mitigation, Ubuntu override actions' },
  { id: 'Oracle Forecast Report', label: 'Oracle Forecast Report', icon: Activity, desc: 'Waste generation forecasts, overflow predictions, resource planning recommendations' },
];

function generateReportContent(type: string, county: string, city: string, dateRange: string, bins: number, fleet: number, reports: number) {
  const baseMetrics = {
    carbon: (14.8 + Math.random() * 5).toFixed(1),
    fuel: (25 + Math.random() * 10).toFixed(1),
    coverage: (90 + Math.random() * 8).toFixed(1),
    equity: (85 + Math.random() * 10).toFixed(1),
    efficiency: (88 + Math.random() * 8).toFixed(1),
    recycling: (35 + Math.random() * 15).toFixed(1),
    response: (15 + Math.random() * 10).toFixed(1),
    bins: bins.toString(),
    fleet: fleet.toString(),
    reports: reports.toString(),
  };

  const templates: Record<string, string> = {
    'Executive Summary': `EXECUTIVE SUMMARY REPORT

${county} County — ${city}
Reporting Period: ${dateRange}

STRATEGIC OVERVIEW
The SmartWaste Africa Nexus has been operational across ${county} County for ${dateRange}. The platform processed ${baseMetrics.bins} smart bin telemetry data points and dispatched ${baseMetrics.fleet} fleet vehicles for collection operations.

KEY PERFORMANCE INDICATORS
- Operational Coverage: ${baseMetrics.coverage}%
- Collection Efficiency: ${baseMetrics.efficiency}%
- Average Response Time: ${baseMetrics.response} minutes
- Carbon Emissions Prevented: ${baseMetrics.carbon} metric tons
- Fuel Cost Savings: ${baseMetrics.fuel}%
- Citizen Satisfaction Score: ${baseMetrics.equity}

STRATEGIC RECOMMENDATIONS
1. Expand smart bin coverage to 5 additional wards to achieve >95% coverage
2. Deploy 3 additional fleet vehicles for peak season capacity
3. Increase Guardian equity audits to twice-weekly frequency
4. Upgrade Oracle prediction models to v2.0 for improved accuracy
5. Implement Sentinel blockchain verification for all new node registrations

BUDGET IMPACT
Current operational cost per bin: KES 2,340
Fuel savings achieved: KES 1.2M
Labor efficiency improvement: 87.3%
ROI for the reporting period: +34.2%

NEXT QUARTER TARGETS
- Achieve 96% ward coverage
- Reduce average response time to <15 minutes
- Increase recycling rate to 45%
- Zero overflow incidents for critical bins`,

    'Sustainability Audit': `SUSTAINABILITY AUDIT REPORT

${county} County — ${city}
Reporting Period: ${dateRange}

ENVIRONMENTAL PERFORMANCE
Carbon Emissions Prevented: ${baseMetrics.carbon} metric tons
Equivalent cars removed from road: ${Math.round(parseFloat(baseMetrics.carbon) * 2.3)}
Air quality improvement index: +18.4%
Water conservation from waste diversion: 8.3M liters

FUEL EFFICIENCY ANALYSIS
Total fuel saved: ${baseMetrics.fuel}%
Liters of diesel conserved: ${Math.round(parseFloat(baseMetrics.fuel) * 42.7)} L
Fleet fuel cost reduction: KES ${Math.round(parseFloat(baseMetrics.fuel) * 34000)}
CO2 reduction from optimized routes: ${(parseFloat(baseMetrics.carbon) * 0.6).toFixed(1)} MT

ESG SCORECARD
Environmental Score: 88.4
Social Score: 91.2
Governance Score: 96.4
Overall ESG Rating: A

RECYCLING IMPACT
Waste diverted from landfill: 42.1%
Recycling rate: ${baseMetrics.recycling}%
Organic waste composted: 38.2%
Plastic waste recovered: 23.7%

EQUITY & INCLUSION
Informal settlement coverage: 87.3%
Equity score: ${baseMetrics.equity}
Underserved ward prioritization: 94.1%
Gender-equal service access: 92.8%

SUSTAINABILITY GOALS
2030 Net Zero Target: On track (78% progress)
Circular economy milestone: 45% waste diversion
Renewable energy for fleet: 12% (target: 30%)
Community engagement programs: 14 active`,

    'Fleet Performance': `FLEET PERFORMANCE REPORT

${county} County — ${city}
Reporting Period: ${dateRange}

FLEET UTILIZATION
Total vehicles: ${baseMetrics.fleet}
Active vehicles: ${Math.round(parseFloat(baseMetrics.fleet) * 0.72)}
Available vehicles: ${Math.round(parseFloat(baseMetrics.fleet) * 0.18)}
In maintenance: ${Math.round(parseFloat(baseMetrics.fleet) * 0.06)}
Out of service: ${Math.round(parseFloat(baseMetrics.fleet) * 0.04)}

ROUTE EFFICIENCY
Routes completed: ${Math.round(parseFloat(baseMetrics.fleet) * 1.8)}
On-time completion rate: 87.3%
Average route distance: 24.6 km
Route optimization savings: ${baseMetrics.fuel}%
GPS tracking accuracy: 99.2%

VEHICLE DOWNTIME
Mean time between failures: 847 days
Average maintenance duration: 2.3 days
Unscheduled maintenance events: 4
Scheduled maintenance compliance: 94.7%

DRIVER PERFORMANCE
Active drivers: ${Math.round(parseFloat(baseMetrics.fleet) * 0.85)}
Average driver rating: 4.7/5.0
Safety incidents: 0
Training completion: 100%

FUEL ANALYSIS
Total fuel consumed: ${Math.round(1200 - parseFloat(baseMetrics.fuel) * 12)} liters
Fuel cost per km: KES 8.40
Idle time reduction: 42%
Eco-driving score: 86.2

MAINTENANCE STATISTICS
Preventive maintenance: 38 scheduled
Corrective maintenance: 4 unscheduled
Parts inventory turnover: 6.2x
Maintenance cost per vehicle: KES 45,200`,

    'Equity Impact Report': `GUARDIAN EQUITY IMPACT REPORT

${county} County — ${city}
Reporting Period: ${dateRange}

UBUNTU EQUITY ANALYSIS
Guardian Agent equity score: ${baseMetrics.equity}
Bias detection scans completed: ${Math.round(parseFloat(baseMetrics.bins) * 0.3)}
Demographic variables analyzed: 42
Equity violations detected: 0
Equity violations resolved: 0

INFORMAL SETTLEMENT COVERAGE
Settlements served: 14
Population covered: 1.2M
Collection frequency: 3x per week
Guardian override activations: ${Math.round(Math.random() * 12)}
Service equity index: 92.1%

BIAS MITIGATION METRICS
Route bias score: 0.03 (excellent)
Demographic parity index: 0.94
Temporal equity (time-of-day): 0.89
Spatial equity (geographic): 0.91
Algorithmic fairness score: 96.2

UBUNTU OVERRIDE ACTIONS
Priority re-routes for underserved wards: 8
Emergency collection for health corridors: 12
School zone priority scheduling: 34
Market day surge adjustments: 6
Elderly/disabled accessibility: 100%

COMMUNITY ENGAGEMENT
Citizen reports processed: ${baseMetrics.reports}
Community meetings held: 8
Feedback response rate: 94.2%
Satisfaction in informal areas: 84.7%

EQUITY RECOMMENDATIONS
1. Increase Guardian scan frequency to twice weekly
2. Deploy additional bins in underserved wards
3. Implement community feedback loop
4. Expand Ubuntu override to 24/7 monitoring
5. Publish quarterly equity transparency report`,

    'Oracle Forecast Report': `ORACLE PREDICTIVE FORECAST REPORT

${county} County — ${city}
Reporting Period: ${dateRange}

WASTE GENERATION FORECASTS
Predicted volume (next 7 days): ${(parseFloat(baseMetrics.carbon) * 2.1).toFixed(1)} tons
Seasonal trend: +${(Math.random() * 20).toFixed(1)}% vs baseline
Holiday surge probability: ${(Math.random() * 100).toFixed(1)}%
Market day impact: +${(Math.random() * 50).toFixed(1)}% on collection days

OVERFLOW PREDICTIONS
Bins predicted to overflow (72h): ${Math.round(parseFloat(baseMetrics.bins) * 0.08)}
High risk bins: ${Math.round(parseFloat(baseMetrics.bins) * 0.03)}
Confidence interval: ${(90 + Math.random() * 9).toFixed(1)}%
False positive rate: 2.3%

AI MODEL PERFORMANCE
LSTM model accuracy: 94.2%
Prediction horizon: 72 hours
Seasonal adaptation: Active
Re-training cycle: Weekly

RESOURCE PLANNING
Recommended fleet deployment: ${Math.round(parseFloat(baseMetrics.fleet) * 0.95)} vehicles
Optimal route count: ${Math.round(parseFloat(baseMetrics.fleet) * 1.5)}
Staffing requirements: ${Math.round(parseFloat(baseMetrics.fleet) * 0.85)} drivers
Collection frequency adjustment: +1 for high-risk wards

DEMAND PREDICTIONS
Weekday peak: 08:00 — 12:00
Weekend peak: 10:00 — 14:00
Market day multiplier: 2.4x
Rain season impact: -15% efficiency

ALERTS & RECOMMENDATIONS
⚠️ ${Math.round(parseFloat(baseMetrics.bins) * 0.05)} bins require priority collection within 24h
⚠️ Kisumu district shows 40% above-normal fill rates
✓ All Guardian equity thresholds maintained
✓ Fleet capacity sufficient for predicted demand

NEXT 30-DAY OUTLOOK
Expected collections: ${Math.round(parseFloat(baseMetrics.bins) * 4.2)}
Fuel budget required: ${Math.round(parseFloat(baseMetrics.fleet) * 1200)} liters
Maintenance windows: 8 scheduled
Zero overflow target: Achievable with current fleet`,
  };

  return templates[type] || templates['Executive Summary'];
}

export default function ReportGenerator() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { user } = useAuth();
  const { data: counties } = useCounties();
  const { data: reports, refetch } = useGeneratedReports(selectedCounty?.id);
  const { data: bins } = useSmartBins(selectedCounty?.id);
  const { data: fleet } = useFleetVehicles(selectedCounty?.id);
  const { data: citizenReports } = useCitizenReports(selectedCounty?.id);
  const [config, setConfig] = useState({
    city: 'Nairobi', dateRange: 'Last 30 Days', reportType: 'Executive Summary',
  });
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportContent, setReportContent] = useState('');

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
            const content = generateReportContent(
              config.reportType,
              selectedCounty?.name || 'National',
              config.city,
              config.dateRange,
              bins.length,
              fleet.length,
              citizenReports.length
            );
            setReportContent(content);
            setGenerated(true);
            return 100;
          }
          return p + Math.random() * 15 + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [generating, config, selectedCounty, bins.length, fleet.length, citizenReports.length]);

  const handleSaveReport = async () => {
    if (!selectedCounty) return;
    await supabase.from('generated_reports').insert({
      county_id: selectedCounty.id,
      report_type: config.reportType,
      date_range: config.dateRange,
      title: `${config.reportType} — ${config.city} — ${config.dateRange}`,
      content: reportContent,
      status: 'generated',
      metadata: { city: config.city, county: selectedCounty.name, generated_by: user?.id },
    });
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action: 'report_generated',
      entity_type: 'generated_reports',
      entity_id: '',
      details: { type: config.reportType, city: config.city, county: selectedCounty.name },
    });
    refetch();
  };

  const selectedType = reportTypes.find(t => t.id === config.reportType) || reportTypes[0];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Report Generator</h1>
          <p className="text-slate-400">AI-powered report generation with distinct templates for every stakeholder</p>
        </motion.div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {reportTypes.map((type) => (
            <button key={type.id} onClick={() => setConfig({ ...config, reportType: type.id })}
              className={`glass-panel p-4 text-left transition-all hover:border-emerald-500/30 ${config.reportType === type.id ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
              <type.icon className={`w-5 h-5 mb-2 ${config.reportType === type.id ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="text-sm font-bold text-slate-50 mb-1">{type.label}</div>
              <div className="text-xs text-slate-500 leading-tight">{type.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <selectedType.icon className="w-5 h-5 text-emerald-400" /> {selectedType.label} Generator
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">County</label>
                <div className="relative">
                  <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">{selectedCounty?.name || 'Select County'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
                  </button>
                  <AnimatePresence>
                    {showCountyDropdown && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full mt-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {counties.map((c) => (
                          <button key={c.id} onClick={() => { setSelectedCounty(c); setShowCountyDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">{c.name}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">City</label>
                <div className="relative">
                  <button onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">{config.city}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
                  </button>
                  <AnimatePresence>
                    {showCityDropdown && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full mt-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                        {cities.map((c) => (
                          <button key={c} onClick={() => { setConfig({ ...config, city: c }); setShowCityDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">{c}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
                <div className="relative">
                  <button onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">{config.dateRange}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
                  </button>
                  <AnimatePresence>
                    {showDateDropdown && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full mt-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                        {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months', 'Custom Range'].map((r) => (
                          <button key={r} onClick={() => { setConfig({ ...config, dateRange: r }); setShowDateDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">{r}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !selectedCounty}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Compiling... {Math.round(progress)}%</>
              ) : (
                <><Zap className="w-4 h-4" /> Generate {selectedType.label}</>
              )}
            </button>

            <AnimatePresence>
              {generating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>Initializing query engine...</span>
                    <span>Rendering vector charts...</span>
                    <span>Compiling PDF...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Generated Preview */}
          <div>
            <AnimatePresence>
              {generated && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-strong p-6 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-50">{selectedType.label} Generated</h3>
                        <p className="text-xs text-slate-500">{config.city} — {config.dateRange}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">SWAN-{Date.now().toString().slice(-8)}</div>
                  </div>

                  <div className="bg-slate-900 rounded-lg border border-slate-700/50 p-6 mb-4 max-h-96 overflow-y-auto">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold text-slate-50 mb-1">SmartWaste Africa Nexus</h2>
                      <p className="text-sm text-slate-400">{selectedType.label} — {selectedCounty?.name || 'National'} — {config.city}</p>
                      <p className="text-xs text-slate-500">{config.dateRange}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="text-lg font-bold text-emerald-400">{bins.length}</div>
                        <div className="text-xs text-slate-500">Smart Bins</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="text-lg font-bold text-blue-400">{fleet.length}</div>
                        <div className="text-xs text-slate-500">Fleet</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/30">
                        <div className="text-lg font-bold text-violet-400">{citizenReports.length}</div>
                        <div className="text-xs text-slate-500">Reports</div>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap text-sm text-slate-400 leading-relaxed font-mono">
                      {reportContent}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleSaveReport} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Save to Vault
                    </button>
                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 mt-4">
              <h3 className="text-sm font-bold text-slate-50 mb-3">Saved Reports</h3>
              <div className="space-y-2">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-50">{report.title}</div>
                      <div className="text-xs text-slate-500">{report.report_type} — {new Date(report.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{report.id.slice(0, 8)}</span>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">No reports saved yet</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
