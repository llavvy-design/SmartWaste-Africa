import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useSmartBins, useFleetVehicles, useCitizenReports, useIncidents } from '../hooks/useSwanData';
import { MapPin, Layers, Eye, EyeOff, Trash2, Truck, Users, AlertTriangle, Leaf, MapPinned } from 'lucide-react';

const layerConfig = [
  { id: 'bins', label: 'Smart Bins', icon: Trash2, color: '#10B981' },
  { id: 'fleet', label: 'Fleet Vehicles', icon: Truck, color: '#3B82F6' },
  { id: 'reports', label: 'Citizen Reports', icon: Users, color: '#F59E0B' },
  { id: 'overflow', label: 'Overflow Alerts', icon: AlertTriangle, color: '#EF4444' },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf, color: '#8B5CF6' },
  { id: 'incidents', label: 'Incidents', icon: MapPinned, color: '#EC4899' },
];

export default function GISCenter() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties, loading: countiesLoading } = useCounties();
  const { data: bins } = useSmartBins(selectedCounty?.id);
  const { data: fleet } = useFleetVehicles(selectedCounty?.id);
  const { data: reports } = useCitizenReports(selectedCounty?.id);
  const { data: incidents } = useIncidents(selectedCounty?.id);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    bins: true, fleet: true, reports: false, overflow: true, sustainability: false, incidents: false,
  });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const filteredBins = useMemo(() => {
    if (!selectedCity) return bins;
    return bins.filter(b => b.city_id === selectedCity);
  }, [bins, selectedCity]);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (countiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">GIS Command Center</h1>
          <p className="text-slate-400">Interactive geospatial intelligence with multi-layer visualization</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
            {/* County Selector */}
            <div className="glass-panel p-4">
              <h3 className="text-sm font-bold text-slate-50 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> County Selector
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => { setSelectedCounty(null); setSelectedCity(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCounty ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  All Counties (National)
                </button>
                {counties.map(county => (
                  <button
                    key={county.id}
                    onClick={() => { setSelectedCounty(county); setSelectedCity(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCounty?.id === county.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{county.name}</span>
                      <span className="text-xs text-slate-500">{county.smart_bins_count} bins</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="glass-panel p-4">
              <h3 className="text-sm font-bold text-slate-50 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Map Layers
              </h3>
              <div className="space-y-2">
                {layerConfig.map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeLayers[layer.id] ? 'bg-slate-800/80 border border-slate-700' : 'text-slate-500 hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <layer.icon className="w-4 h-4" style={{ color: activeLayers[layer.id] ? layer.color : '#64748B' }} />
                      <span className={activeLayers[layer.id] ? 'text-slate-300' : 'text-slate-500'}>{layer.label}</span>
                    </div>
                    {activeLayers[layer.id] ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Stats */}
            <div className="glass-panel p-4">
              <h3 className="text-sm font-bold text-slate-50 mb-3">Layer Data</h3>
              <div className="space-y-2 text-sm">
                {activeLayers.bins && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Smart Bins</span>
                    <span className="text-emerald-400 font-bold">{filteredBins.length}</span>
                  </div>
                )}
                {activeLayers.fleet && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fleet Vehicles</span>
                    <span className="text-blue-400 font-bold">{fleet.length}</span>
                  </div>
                )}
                {activeLayers.reports && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Citizen Reports</span>
                    <span className="text-amber-400 font-bold">{reports.length}</span>
                  </div>
                )}
                {activeLayers.overflow && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Overflow Risk</span>
                    <span className="text-red-400 font-bold">{filteredBins.filter(b => b.fill_level_pct > 80).length}</span>
                  </div>
                )}
                {activeLayers.incidents && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Incidents</span>
                    <span className="text-rose-400 font-bold">{incidents.filter(i => i.status !== 'resolved').length}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Map Canvas */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            <div className="glass-panel p-0 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
              <div className="relative w-full h-full bg-slate-800/50">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Grid */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <g key={i}>
                      <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#334155" strokeWidth="0.15" />
                      <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#334155" strokeWidth="0.15" />
                    </g>
                  ))}

                  {/* County Boundary Zones (simplified representation) */}
                  {selectedCounty ? (
                    <>
                      <text x="50" y="50" textAnchor="middle" fontSize="4" fill="#64748B" fontWeight="bold">
                        {selectedCounty.name} County
                      </text>
                      <text x="50" y="55" textAnchor="middle" fontSize="2" fill="#475569">
                        {selectedCounty.smart_bins_count} bins | {selectedCounty.fleet_count} trucks
                      </text>
                    </>
                  ) : (
                    counties.slice(0, 20).map((county, i) => {
                      const x = 15 + (i % 5) * 18;
                      const y = 15 + Math.floor(i / 5) * 18;
                      return (
                        <g key={county.id}>
                          <circle cx={x} cy={y} r={3} fill={county.coverage_pct > 85 ? '#10B981' : county.coverage_pct > 70 ? '#F59E0B' : '#EF4444'} opacity="0.7" />
                          <text x={x} y={y + 5} textAnchor="middle" fontSize="1.5" fill="#94A3B8">{county.name}</text>
                          <text x={x} y={y + 7} textAnchor="middle" fontSize="1.2" fill="#64748B">{county.coverage_pct}%</text>
                        </g>
                      );
                    })
                  )}

                  {/* Bin Markers */}
                  {activeLayers.bins && filteredBins.map((bin, i) => {
                    const x = 20 + (i % 8) * 10;
                    const y = 20 + Math.floor(i / 8) * 12;
                    const color = bin.fill_level_pct > 80 ? '#EF4444' : bin.fill_level_pct > 50 ? '#F59E0B' : '#10B981';
                    const isCritical = bin.fill_level_pct > 80;
                    return (
                      <g key={bin.id}>
                        {isCritical && (
                          <circle cx={x} cy={y} r="3" fill={color} opacity="0.3">
                            <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle cx={x} cy={y} r="1.5" fill={color} />
                        <text x={x} y={y - 2} textAnchor="middle" fontSize="1.5" fill="#94A3B8">{bin.bin_id}</text>
                      </g>
                    );
                  })}

                  {/* Fleet Markers */}
                  {activeLayers.fleet && fleet.map((vehicle, i) => {
                    const x = 25 + (i % 6) * 12;
                    const y = 30 + Math.floor(i / 6) * 15;
                    const color = vehicle.status === 'active' ? '#3B82F6' : vehicle.status === 'available' ? '#10B981' : '#F59E0B';
                    return (
                      <g key={vehicle.id}>
                        <rect x={x - 1} y={y - 1} width="2" height="2" fill={color} rx="0.3" />
                        <text x={x} y={y - 2} textAnchor="middle" fontSize="1.5" fill="#94A3B8">{vehicle.fleet_id}</text>
                      </g>
                    );
                  })}

                  {/* Legend */}
                  <g transform="translate(5, 88)">
                    {activeLayers.bins && (
                      <>
                        <circle cx="3" cy="3" r="1.5" fill="#10B981" /><text x="5" y="4" fontSize="2" fill="#94A3B8">&lt;50% Stable</text>
                        <circle cx="20" cy="3" r="1.5" fill="#F59E0B" /><text x="22" y="4" fontSize="2" fill="#94A3B8">50-80% Warn</text>
                        <circle cx="42" cy="3" r="1.5" fill="#EF4444" /><text x="44" y="4" fontSize="2" fill="#94A3B8">&gt;80% Critical</text>
                      </>
                    )}
                    {activeLayers.fleet && (
                      <>
                        <rect x="65" y="2" width="2" height="2" fill="#3B82F6" /><text x="68" y="4" fontSize="2" fill="#94A3B8">Fleet</text>
                      </>
                    )}
                  </g>
                </svg>

                {/* Overlay info */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-700/50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">View</div>
                  <div className="text-sm font-bold text-slate-50">
                    {selectedCounty ? selectedCounty.name : 'National View'} — {selectedCounty ? filteredBins.length : counties.reduce((s, c) => s + c.smart_bins_count, 0)} bins
                  </div>
                </div>

                {/* Selected county detail overlay */}
                {selectedCounty && (
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-700/50 p-4 max-w-xs">
                    <div className="text-sm font-bold text-slate-50 mb-2">{selectedCounty.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-slate-500">Bins: <span className="text-slate-50">{selectedCounty.smart_bins_count}</span></div>
                      <div className="text-slate-500">Fleet: <span className="text-slate-50">{selectedCounty.fleet_count}</span></div>
                      <div className="text-slate-500">Coverage: <span className="text-emerald-400">{selectedCounty.coverage_pct}%</span></div>
                      <div className="text-slate-500">Carbon: <span className="text-slate-50">{selectedCounty.carbon_saved_tons} MT</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
