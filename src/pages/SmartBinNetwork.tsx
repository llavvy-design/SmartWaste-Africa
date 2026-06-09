import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useSmartBins, useCities } from '../hooks/useSwanData';
import { Trash2, Battery, Thermometer, Sun, Bug, Zap, MapPin, ChevronDown, X, Activity } from 'lucide-react';
import type { SmartBin } from '../types';

function BinDetailCard({ bin, onClose }: { bin: SmartBin; onClose: () => void }) {
  const fillColor = bin.fill_level_pct > 80 ? 'text-red-400' : bin.fill_level_pct > 50 ? 'text-amber-400' : 'text-emerald-400';
  const fillBar = bin.fill_level_pct > 80 ? 'bg-red-500' : bin.fill_level_pct > 50 ? 'bg-amber-500' : 'bg-emerald-500';
  const batteryColor = bin.battery_pct > 50 ? 'text-emerald-400' : bin.battery_pct > 25 ? 'text-amber-400' : 'text-red-400';
  const solarColor = bin.solar_charge_pct > 60 ? 'text-emerald-400' : bin.solar_charge_pct > 30 ? 'text-amber-400' : 'text-slate-400';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel-strong p-6 border border-emerald-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-50">{bin.bin_id}</h3>
            <p className="text-xs text-slate-500">{bin.address}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Fill Level</div>
          <div className={`text-2xl font-bold ${fillColor}`}>{bin.fill_level_pct}%</div>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${fillBar}`} style={{ width: `${bin.fill_level_pct}%` }} />
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Battery</div>
          <div className={`text-2xl font-bold ${batteryColor}`}>{bin.battery_pct}%</div>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${bin.battery_pct > 50 ? 'bg-emerald-500' : bin.battery_pct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bin.battery_pct}%` }} />
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Temperature</div>
          <div className="text-2xl font-bold text-slate-50">{bin.temperature_c.toFixed(1)}°C</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <Thermometer className="w-3 h-3" /> Normal range
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Solar Charge</div>
          <div className={`text-2xl font-bold ${solarColor}`}>{bin.solar_charge_pct}%</div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <Sun className="w-3 h-3" /> PV panel active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`p-2 rounded-lg border text-center ${bin.pest_detected ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800/50 border-slate-700/30 text-emerald-400'}`}>
          <Bug className="w-4 h-4 mx-auto mb-1" />
          <div className="text-xs font-medium">{bin.pest_detected ? 'Pest Alert' : 'Pest Clear'}</div>
        </div>
        <div className={`p-2 rounded-lg border text-center ${bin.compactor_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
          <Zap className="w-4 h-4 mx-auto mb-1" />
          <div className="text-xs font-medium">{bin.compactor_active ? 'Active' : 'Standby'}</div>
        </div>
        <div className={`p-2 rounded-lg border text-center ${bin.guardian_override ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
          <Activity className="w-4 h-4 mx-auto mb-1" />
          <div className="text-xs font-medium">{bin.guardian_override ? 'Guardian Override' : 'Normal'}</div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Odor Index</span>
          <span className="text-slate-50">{bin.odor_index}/100</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Sensor Health</span>
          <span className="text-emerald-400 capitalize">{bin.sensor_health}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Last Collection</span>
          <span className="text-slate-50">{bin.last_collection_at ? new Date(bin.last_collection_at).toLocaleString() : 'Never'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Last Telemetry</span>
          <span className="text-slate-50">{bin.last_telemetry_at ? new Date(bin.last_telemetry_at).toLocaleString() : 'N/A'}</span>
        </div>
        {bin.predicted_overflow_at && (
          <div className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/20">
            <span className="text-red-400">Predicted Overflow</span>
            <span className="text-red-400 font-bold">{new Date(bin.predicted_overflow_at).toLocaleString()}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SmartBinNetwork() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: cities } = useCities(selectedCounty?.id);
  const { data: bins, loading } = useSmartBins(selectedCounty?.id);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all');
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

  const filteredBins = useMemo(() => {
    let filtered = bins;
    if (selectedCity) filtered = filtered.filter(b => b.city_id === selectedCity);
    if (filterStatus === 'critical') filtered = filtered.filter(b => b.fill_level_pct > 80);
    if (filterStatus === 'warning') filtered = filtered.filter(b => b.fill_level_pct > 50 && b.fill_level_pct <= 80);
    if (filterStatus === 'healthy') filtered = filtered.filter(b => b.fill_level_pct <= 50);
    return filtered;
  }, [bins, selectedCity, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Smart Bin Network</h1>
          <p className="text-slate-400">Real-time infrastructure monitoring across all connected counties</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative">
            <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">{selectedCounty?.name || 'All Counties'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            <AnimatePresence>
              {showCountyDropdown && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-1 left-0 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  <button onClick={() => { setSelectedCounty(null); setSelectedCity(null); setShowCountyDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 border-b border-slate-700">
                    All Counties
                  </button>
                  {counties.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCounty(c); setSelectedCity(null); setShowCountyDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                      {c.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedCounty && (
            <div className="flex gap-2">
              <button onClick={() => setSelectedCity(null)}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${!selectedCity ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                All Cities
              </button>
              {cities.map(city => (
                <button key={city.id} onClick={() => setSelectedCity(city.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${selectedCity === city.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  {city.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            {(['all', 'healthy', 'warning', 'critical'] as const).map(status => (
              <button key={status} onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${filterStatus === status ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="metric-card">
            <div className="text-xs text-slate-500 mb-1">Total Bins</div>
            <div className="text-2xl font-bold text-slate-50">{filteredBins.length}</div>
          </div>
          <div className="metric-card border-l-2 border-l-emerald-500">
            <div className="text-xs text-slate-500 mb-1">Healthy</div>
            <div className="text-2xl font-bold text-emerald-400">{filteredBins.filter(b => b.fill_level_pct <= 50).length}</div>
          </div>
          <div className="metric-card border-l-2 border-l-amber-500">
            <div className="text-xs text-slate-500 mb-1">Warning</div>
            <div className="text-2xl font-bold text-amber-400">{filteredBins.filter(b => b.fill_level_pct > 50 && b.fill_level_pct <= 80).length}</div>
          </div>
          <div className="metric-card border-l-2 border-l-red-500">
            <div className="text-xs text-slate-500 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-400">{filteredBins.filter(b => b.fill_level_pct > 80).length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bin Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredBins.map((bin, index) => {
                const fillColor = bin.fill_level_pct > 80 ? 'border-red-500/30 bg-red-500/5' : bin.fill_level_pct > 50 ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5';
                const fillBar = bin.fill_level_pct > 80 ? 'bg-red-500' : bin.fill_level_pct > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                const fillText = bin.fill_level_pct > 80 ? 'text-red-400' : bin.fill_level_pct > 50 ? 'text-amber-400' : 'text-emerald-400';
                return (
                  <motion.div key={bin.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}
                    onClick={() => setSelectedBin(bin)}
                    className={`glass-panel p-4 cursor-pointer hover:scale-[1.02] transition-all border ${fillColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-50">{bin.bin_id}</span>
                      {bin.guardian_override && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${fillText} mb-2`}>{bin.fill_level_pct}%</div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full ${fillBar}`} style={{ width: `${bin.fill_level_pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className={`flex items-center gap-1 ${bin.battery_pct > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <Battery className="w-3 h-3" /> {bin.battery_pct}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3" /> {bin.solar_charge_pct}%
                      </span>
                    </div>
                    {bin.pest_detected && (
                      <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                        <Bug className="w-3 h-3" /> Pest Detected
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedBin ? (
                <BinDetailCard key={selectedBin.id} bin={selectedBin} onClose={() => setSelectedBin(null)} />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel p-6 text-center">
                  <Trash2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Select a bin to view detailed sensor data</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
