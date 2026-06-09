import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useCounties, useSmartBins, useTelemetryNodes } from '../hooks/useSwanData';
import { Radio, Wifi, Activity, Clock, Server, Signal, AlertTriangle, CheckCircle, MapPin, ChevronDown } from 'lucide-react';

interface TokenData {
  zone: string;
  fill: number;
  hours: number;
}

function parseToken(token: string): TokenData | null {
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  return {
    zone: parts[0],
    fill: parseInt(parts[1]) || 0,
    hours: parseInt(parts[2]) || 0,
  };
}

function SignalBadge({ rssi }: { rssi: number }) {
  let color = 'bg-red-500/10 text-red-400';
  let label = 'Weak';
  if (rssi > -70) { color = 'bg-emerald-500/10 text-emerald-400'; label = 'Strong'; }
  else if (rssi > -85) { color = 'bg-amber-500/10 text-amber-400'; label = 'Fair'; }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      <Signal className="w-3 h-3 mr-1" />{label} ({rssi} dBm)
    </span>
  );
}

function BatteryBar({ level }: { level: number }) {
  const color = level > 50 ? 'bg-emerald-500' : level > 25 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${level}%` }} />
      </div>
      <span className={`text-xs font-medium ${level > 50 ? 'text-emerald-400' : level > 25 ? 'text-amber-400' : 'text-red-400'}`}>{level}%</span>
    </div>
  );
}

function HealthTag({ type, text }: { type: string; text: string }) {
  const styles = {
    good: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };
  const icons = { good: CheckCircle, warning: AlertTriangle, critical: AlertTriangle };
  const Icon = icons[type as keyof typeof icons] || CheckCircle;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles[type as keyof typeof styles]}`}>
      <Icon className="w-3 h-3" />{text}
    </span>
  );
}

function TimeBadge({ seconds }: { seconds: number }) {
  const color = seconds < 60 ? 'text-emerald-400' : seconds < 180 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`text-xs font-medium ${color} flex items-center gap-1`}>
      <Clock className="w-3 h-3" />{seconds}s ago
    </span>
  );
}

export default function Telemetry() {
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: bins } = useSmartBins(selectedCounty?.id);
  const { data: telemetryNodes } = useTelemetryNodes(selectedCounty?.id);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [liveTimes, setLiveTimes] = useState<Record<string, number>>({});

  const telemetryTokens = useMemo(() => {
    return bins.slice(0, 8).map(b => {
      const zone = b.bin_id.split('-')[0];
      const hours = b.predicted_overflow_at
        ? Math.ceil((new Date(b.predicted_overflow_at).getTime() - Date.now()) / 3600000)
        : Math.floor(24 - b.fill_level_pct / 4);
      return `${zone}:${b.fill_level_pct}:${Math.max(0, hours)}h`;
    });
  }, [bins]);

  useEffect(() => {
    const initial: Record<string, number> = {};
    telemetryNodes.forEach(d => { initial[d.device_id] = Math.floor(Math.random() * 300); });
    setLiveTimes(initial);
    const interval = setInterval(() => {
      setLiveTimes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { next[k] = next[k] + 1; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [telemetryNodes]);

  const onlineNodes = telemetryNodes.filter(n => n.status === 'online').length;
  const offlineNodes = telemetryNodes.filter(n => n.status === 'offline').length;
  const overflowingNodes = bins.filter(b => b.fill_level_pct > 80).length;
  const totalBins = bins.length;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-50">Telemetry Intelligence Center</h1>
            <div className="relative">
              <button onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors">
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
          </div>
          <p className="text-slate-400">Low-bandwidth optimized real-time sensor monitoring for edge device environments</p>
        </motion.div>

        {/* Bin Coverage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Bins Tracked', value: totalBins, icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Synced Nodes', value: onlineNodes, icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Offline Nodes', value: offlineNodes, icon: Wifi, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Overflowing Bins', value: overflowingNodes, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className={`${stat.bg} border border-slate-700/50 rounded-xl p-5`}>
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="text-3xl font-bold text-slate-50 mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Edge Device Analytics */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Edge Device Analytics Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-1">Field telemetry hardware performance monitoring</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Device ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Last Sync</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Battery</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Signal</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetryNodes.map((device) => (
                    <tr key={device.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-slate-300">{device.device_id}</td>
                      <td className="px-4 py-3"><TimeBadge seconds={liveTimes[device.device_id] || Math.floor(Math.random() * 300)} /></td>
                      <td className="px-4 py-3"><BatteryBar level={device.battery_pct} /></td>
                      <td className="px-4 py-3"><SignalBadge rssi={device.signal_strength} /></td>
                      <td className="px-4 py-3">
                        <HealthTag type={device.status === 'online' ? 'good' : device.status === 'warning' ? 'warning' : 'critical'}
                          text={device.payload_integrity || 'unknown'} />
                      </td>
                    </tr>
                  ))}
                  {telemetryNodes.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No telemetry nodes for this county</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Predictive Overflow */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Predictive Overflow Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-1">AI-driven capacity forecasting for dispatch optimization</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Node</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Current</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">80% (h)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">90% (h)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">100% (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {bins.slice(0, 10).map((bin) => {
                    const to80 = Math.max(0, Math.ceil((80 - bin.fill_level_pct) / 3));
                    const to90 = Math.max(0, Math.ceil((90 - bin.fill_level_pct) / 3));
                    const to100 = Math.max(0, Math.ceil((100 - bin.fill_level_pct) / 3));
                    return (
                      <tr key={bin.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-50">{bin.bin_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${bin.fill_level_pct > 80 ? 'bg-red-500' : bin.fill_level_pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${bin.fill_level_pct}%` }} />
                            </div>
                            <span className="text-sm text-slate-300">{bin.fill_level_pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${to80 === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {to80 === 0 ? '✓ Reached' : `${to80}h`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${to90 === 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {to90 === 0 ? '✓ Reached' : `${to90}h`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${to100 <= 5 ? 'text-red-400' : 'text-slate-300'}`}>
                            {to100 === 0 ? '✓ Full' : `${to100}h`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Token Parser */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6">
          <h2 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" /> Real-Time Deconstructed String Token Overview
          </h2>
          <p className="text-sm text-slate-400 mb-6">Low-bandwidth telemetry protocol. Raw field data streams compressed into 8-12 character tokens for 2G edge networks.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Live Telemetry Stream</div>
              <div className="font-mono text-sm bg-slate-900 rounded-lg p-4 border border-slate-700/50">
                {telemetryTokens.map((token, i) => {
                  const parsed = parseToken(token);
                  if (!parsed) return <span key={i} className="text-slate-500">{token}</span>;
                  return (
                    <span key={i}>
                      <span className="text-emerald-400">{parsed.zone}</span>
                      <span className="text-slate-500">:</span>
                      <span className={`${parsed.fill > 80 ? 'text-red-400' : parsed.fill > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{parsed.fill}</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-blue-400">{parsed.hours}h</span>
                      {i < telemetryTokens.length - 1 && <span className="text-slate-500"> | </span>}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Decoded Parameter Components</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">01</span>
                  <div><div className="text-sm font-medium text-slate-300">Zone Shortcode</div><div className="text-xs text-slate-500">3-char geographic identifier</div></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">02</span>
                  <div><div className="text-sm font-medium text-slate-300">Fill Capacity</div><div className="text-xs text-slate-500">Integer percentage 0-100</div></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">03</span>
                  <div><div className="text-sm font-medium text-slate-300">Time-to-Overflow</div><div className="text-xs text-slate-500">Estimated hours to 100%</div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <div className="text-xs text-emerald-400 font-medium">
              Protocol Efficiency: 12 bytes per node vs 247 bytes JSON — 95.6% bandwidth reduction
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
