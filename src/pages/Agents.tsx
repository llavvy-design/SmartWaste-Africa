import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCounty } from '../context/CountyContext';
import { useSmartBins, useFleetVehicles, useCitizenReports, useIncidents } from '../hooks/useSwanData';
import {
  Search, Shield, Zap, Heart, Brain, AlertTriangle, Radio,
  CheckCircle, Activity, Clock, Terminal, MapPin, Wrench
} from 'lucide-react';

interface AgentDef {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const agentDefs: AgentDef[] = [
  { id: 'scout', name: 'Scout Agent', description: 'Telemetry ingestion, anomaly detection, drift tracking', icon: Search, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { id: 'guardian', name: 'Guardian Agent', description: 'Equity enforcement, bias detection, Ubuntu ethics engine', icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { id: 'hunter', name: 'Hunter Agent', description: 'Route optimization, fleet allocation, dispatch planning', icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { id: 'ranger', name: 'Ranger Agent', description: 'Infrastructure monitoring, maintenance forecasting', icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  { id: 'oracle', name: 'Oracle Agent', description: 'Predictive forecasting, overflow prediction, demand prediction', icon: Brain, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  { id: 'sentinel', name: 'Sentinel Agent', description: 'Security auditing, fraud detection, threat prevention', icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
];

const consoleTypes = [
  { id: 'scout', title: 'Scout Telemetry', icon: Radio, color: 'text-emerald-400' },
  { id: 'guardian', title: 'Guardian Ethics', icon: Shield, color: 'text-blue-400' },
  { id: 'hunter', title: 'Hunter Routing', icon: Zap, color: 'text-amber-400' },
  { id: 'ranger', title: 'Ranger Maintenance', icon: Wrench, color: 'text-rose-400' },
  { id: 'oracle', title: 'Oracle Prediction', icon: Brain, color: 'text-violet-400' },
  { id: 'sentinel', title: 'Sentinel Security', icon: AlertTriangle, color: 'text-orange-400' },
  { id: 'system', title: 'System Monitor', icon: Activity, color: 'text-cyan-400' },
  { id: 'fleet', title: 'Fleet Dispatch', icon: MapPin, color: 'text-pink-400' },
];

interface LogEntry {
  timestamp: string;
  type: string;
  message: string;
  level: 'info' | 'warn' | 'success';
}

const generateLog = (type: string, county?: string | null): LogEntry => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  const levels: LogEntry['level'][] = ['info', 'warn', 'success'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const countyName = county || 'National';

  const messages: Record<string, string[]> = {
    scout: [
      `Telemetry batch: 47 nodes from ${countyName}`,
      `Anomaly detected: fill rate spike +340%`,
      `Sensor sync completed: Node-NW-014`,
      `Drift detected in zone temperature baseline`,
      `Edge device back online after 3s timeout`,
      `Data validation: 1,420/1,420 nodes passed`,
    ],
    guardian: [
      `Equity audit: all zones within compliance`,
      `Ubuntu override triggered for underserved ward`,
      `Bias scan: 0 anomalies across 42 variables`,
      `Re-route recommendation generated for equity gap`,
      `Guardian confidence: ${98 + Math.random() * 2}%`,
      `Safety override loop #${Math.floor(Math.random() * 5000)} complete`,
    ],
    hunter: [
      `Route optimization: ${(Math.random() * 5).toFixed(1)}km saved`,
      `TSP solver: ${Math.floor(Math.random() * 200)} routes in ${(Math.random() * 2).toFixed(1)}s`,
      `Fuel delta: -${(Math.random() * 30).toFixed(1)}% vs baseline`,
      `Vehicle reassigned to priority zone`,
      `Dynamic scheduling: emergency pickups added`,
      `ETA recalculated: ${Math.floor(Math.random() * 30)} minutes`,
    ],
    ranger: [
      `Sensor battery at ${Math.floor(Math.random() * 30)}% — maintenance scheduled`,
      `Solar panel degradation detected: ${(Math.random() * 10).toFixed(1)}%`,
      `Truck maintenance due in ${Math.floor(Math.random() * 30)} days`,
      `Hardware node MTBF: ${Math.floor(600 + Math.random() * 400)} days`,
      `Preventive scan complete: ${Math.floor(Math.random() * 50)} items flagged`,
      `Bin lid actuator health check: passed`,
    ],
    oracle: [
      `LSTM model: ${Math.floor(Math.random() * 10)} capacity spikes predicted`,
      `Confidence interval: ${(90 + Math.random() * 9).toFixed(1)}%`,
      `Market day surge detected in district`,
      `Holiday waste volume forecast: +${Math.floor(Math.random() * 200)}%`,
      `Overflow probability: ${(Math.random() * 100).toFixed(1)}% for node`,
      `Seasonal trend updated: Q${Math.floor(Math.random() * 4) + 1} pattern`,
    ],
    sentinel: [
      `Scanning ${Math.floor(Math.random() * 5000)} telemetry entries/hour`,
      `Suspicious packet quarantined`,
      `Cryptographic signature verified`,
      `Zero-day vulnerability scan: clean`,
      `Blockchain integrity: verified`,
      `Fraud prevention rule triggered: 2 blocks`,
    ],
    system: [
      `CPU load: ${(Math.random() * 60).toFixed(1)}%`,
      `Memory usage: ${(Math.random() * 80).toFixed(1)}%`,
      `Database replication: synced`,
      `Edge function latency: ${Math.floor(Math.random() * 200)}ms`,
      `Queue depth: ${Math.floor(Math.random() * 100)} messages`,
      `Network throughput: ${(Math.random() * 100).toFixed(1)} Mbps`,
    ],
    fleet: [
      `Dispatch queue: ${Math.floor(Math.random() * 50)} jobs pending`,
      `Fleet utilization: ${(Math.random() * 100).toFixed(1)}%`,
      `Route completion rate: ${(Math.random() * 100).toFixed(1)}%`,
      `Driver shift change: 3 vehicles reassigned`,
      `Emergency reroute: flooding on main road`,
      `Collection schedule optimized: ${Math.floor(Math.random() * 20)}% faster`,
    ],
  };

  const list = messages[type] || messages.system;
  return {
    timestamp: time,
    type,
    message: list[Math.floor(Math.random() * list.length)],
    level,
  };
};

function AgentCard({ agent, index, stats }: { agent: AgentDef; index: number; stats: { processing: number; confidence: number; health: number; tasks: number; status: string } }) {
  const StatusIcon = stats.status === 'online' ? CheckCircle : stats.status === 'processing' ? Activity : Clock;
  const statusColor = stats.status === 'online' ? 'text-emerald-400' : stats.status === 'processing' ? 'text-amber-400' : 'text-slate-400';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="glass-panel p-6 hover:border-emerald-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${agent.bgColor} flex items-center justify-center`}>
          <agent.icon className={`w-6 h-6 ${agent.color}`} />
        </div>
        <div className={`flex items-center gap-1.5 ${statusColor}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-medium capitalize">{stats.status}</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-50 mb-2">{agent.name}</h3>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{agent.description}</p>
      <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Current Mission</div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {agent.id === 'scout' && `Processing ${stats.processing} telemetry streams with real-time anomaly detection.`}
          {agent.id === 'guardian' && `Running equity audit across all collection zones. Ubuntu safety override active.`}
          {agent.id === 'hunter' && `Optimizing fleet routes for maximum fuel efficiency. ${stats.tasks} routes recalculated.`}
          {agent.id === 'ranger' && `Monitoring ${stats.processing} infrastructure nodes. Predictive maintenance active.`}
          {agent.id === 'oracle' && `Training LSTM models. ${stats.tasks} predictions generated for next 72 hours.`}
          {agent.id === 'sentinel' && `Scanning ${stats.processing} telemetry entries per hour. Security audit active.`}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-50">{stats.processing.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Processing</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${agent.color}`}>{stats.confidence}%</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${stats.health > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{stats.health}%</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Health</div>
        </div>
      </div>
    </motion.div>
  );
}

function LogConsole({ title, type, icon: Icon, color, county }: { title: string; type: string; icon: React.ElementType; color: string; county?: string | null }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: LogEntry[] = [];
    for (let i = 0; i < 5; i++) initial.push(generateLog(type, county));
    setLogs(initial);
    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, generateLog(type, county)];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 2500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [type, county]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="text-sm font-bold text-slate-50">{title}</h3>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500">LIVE</span>
        </span>
      </div>
      <div ref={scrollRef} className="p-4 h-56 overflow-y-auto font-mono text-xs scrollbar-thin">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-2 mb-1.5">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={`${log.level === 'success' ? 'text-emerald-400' : log.level === 'warn' ? 'text-amber-400' : 'text-slate-400'}`}>
              {log.level === 'success' ? '✓' : log.level === 'warn' ? '⚠' : 'ℹ'} {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Agents() {
  const { selectedCounty } = useCounty();
  const { data: bins } = useSmartBins(selectedCounty?.id);
  const { data: fleet } = useFleetVehicles(selectedCounty?.id);
  const { data: reports } = useCitizenReports(selectedCounty?.id);
  const { data: incidents } = useIncidents(selectedCounty?.id);

  const agentStats = {
    scout: { processing: bins.length, confidence: 94, health: 97, tasks: Math.floor(bins.length * 0.8), status: 'online' },
    guardian: { processing: Math.floor(bins.length * 0.3), confidence: 98, health: 95, tasks: reports.length, status: 'processing' },
    hunter: { processing: fleet.length, confidence: 88, health: 92, tasks: Math.floor(fleet.length * 1.5), status: 'online' },
    ranger: { processing: Math.floor(bins.length * 0.4), confidence: 92, health: 94, tasks: Math.floor(bins.length * 0.1), status: 'online' },
    oracle: { processing: Math.floor(bins.length * 0.6), confidence: 95, health: 96, tasks: Math.floor(bins.length * 0.2), status: 'processing' },
    sentinel: { processing: Math.floor(bins.length * 2.7), confidence: 99, health: 99, tasks: incidents.length, status: 'online' },
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Multi-Agent Operations Center</h1>
          <p className="text-slate-400">Six autonomous AI agents operating across {selectedCounty?.name || 'all'} counties with 8 live operational consoles</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agentDefs.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} stats={agentStats[agent.id as keyof typeof agentStats]} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" /> Real-Time Multi-Console Log System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {consoleTypes.map((console) => (
              <LogConsole key={console.id} title={console.title} type={console.id} icon={console.icon} color={console.color} county={selectedCounty?.name} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
