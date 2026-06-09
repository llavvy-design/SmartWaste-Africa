import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAggregateStats, useCounties } from '../hooks/useSwanData';
import {
  ArrowRight, ChevronDown, Globe, Trash2, Truck, TrendingUp,
  TreePine, Users, Activity, MapPin, Shield, Brain, Zap,
  Radio, BarChart3
} from 'lucide-react';

function AnimatedCounter({ target, suffix = '', duration = 2000, decimals = 0 }: { target: number; suffix?: string; duration?: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((easeOut * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration, decimals]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const aboutCards = [
  {
    title: 'System Problem Statement',
    content: 'Urban waste logistics in high-density sectors face algorithmic environmental neglect. Legacy collection schedules fail to account for real-time population flux, seasonal variations, and informal settlement expansion. Municipal budgets are drained by reactive rather than predictive infrastructure management.',
    icon: Activity,
  },
  {
    title: 'Core Technological Innovation',
    content: 'Our proprietary low-byte telemetry string tokens operate efficiently on 2G edge devices. The protocol compresses sensor readings into 8-12 character payloads, enabling real-time monitoring across bandwidth-constrained rural and peri-urban corridors. Battery life extends to 18+ months on single-cell Li-SOCl2.',
    icon: Radio,
  },
  {
    title: 'Operational Municipal Impact',
    content: 'Target: 30% fleet fuel reduction through AI-optimized routing. Mandatory 24-hour collection windows ensure zero overnight waste accumulation in public health corridors. Dynamic scheduling reduces idle truck time by 42% during off-peak periods.',
    icon: Truck,
  },
  {
    title: 'Key Engineering Benefits',
    content: 'Inclusive icon-based UI workflows for low-literacy operators. Automated local caching with SQLite fallback ensures offline-first resilience. Progressive web app architecture enables sub-50KB initial payloads. Mesh network topology provides redundant connectivity paths.',
    icon: Shield,
  },
];

const agentCards = [
  { name: 'Scout', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Telemetry ingestion & anomaly detection' },
  { name: 'Guardian', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Equity enforcement & bias detection' },
  { name: 'Hunter', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Route optimization & fleet allocation' },
  { name: 'Ranger', icon: TreePine, color: 'text-rose-400', bg: 'bg-rose-500/10', desc: 'Infrastructure monitoring & maintenance' },
  { name: 'Oracle', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', desc: 'Predictive analytics & overflow forecasting' },
  { name: 'Sentinel', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', desc: 'Security auditing & fraud prevention' },
];

export default function Home() {
  const navigate = useNavigate();
  const aboutRef = useRef<HTMLDivElement>(null);
  const { stats, loading } = useAggregateStats();
  const { data: counties } = useCounties();

  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: 'smooth' });

  const heroStats = loading ? [
    { label: 'Counties Connected', value: 47, suffix: '', icon: Globe },
    { label: 'Active Smart Bins', value: 0, suffix: '', icon: Trash2 },
    { label: 'Fleet Assets', value: 0, suffix: '', icon: Truck },
    { label: 'Dispatch Success', value: 0, suffix: '%', icon: TrendingUp },
    { label: 'Carbon Prevented', value: 0, suffix: ' MT', icon: TreePine },
    { label: 'Citizen Reports', value: 0, suffix: '', icon: Users },
  ] : [
    { label: 'Counties Connected', value: stats.totalCounties, suffix: '', icon: Globe },
    { label: 'Active Smart Bins', value: stats.totalBins, suffix: '', icon: Trash2 },
    { label: 'Fleet Assets', value: stats.totalFleet, suffix: '', icon: Truck },
    { label: 'Dispatch Success', value: stats.avgCoverage, suffix: '%', icon: TrendingUp },
    { label: 'Carbon Prevented', value: stats.totalCarbon, suffix: ' MT', icon: TreePine },
    { label: 'Citizen Reports', value: stats.totalReports, suffix: '', icon: Users },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              47 Counties Connected — Real-Time National Operations
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-slate-50">SmartWaste</span>{' '}
            <span className="text-gradient">Africa Nexus</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            The Autonomous Multi-Agent Smart-City Command Center for Emerging Metropolitan Infrastructures.
          </motion.p>

          {/* Dynamic Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {heroStats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + index * 0.1 }}
                className="metric-card text-center">
                <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-slate-50 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => navigate('/dashboard')} className="btn-primary inline-flex items-center gap-2 group">
              Access Mission Control <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={scrollToAbout} className="btn-secondary inline-flex items-center gap-2 group">
              Explore Architecture <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </button>
            <button onClick={() => navigate('/digital-twin')} className="btn-secondary inline-flex items-center gap-2 group">
              <MapPin className="w-4 h-4" /> Digital Twin Kenya
            </button>
          </motion.div>

          {/* County Quick Preview */}
          {counties.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="text-slate-400">Active counties:</span>
              {counties.slice(0, 8).map(c => (
                <span key={c.id} className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50 text-slate-400">
                  {c.name}
                </span>
              ))}
              {counties.length > 8 && (
                <span className="text-slate-600">+{counties.length - 8} more</span>
              )}
            </motion.div>
          )}
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-slate-600" />
        </motion.div>
      </section>

      {/* Agent Architecture Preview */}
      <section className="py-20 px-4 relative border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Multi-Agent Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Six autonomous AI agents operating in parallel across Kenya's 47 counties, ensuring zero waste overflow and equitable service delivery.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {agentCards.map((agent, index) => (
              <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                onClick={() => navigate('/agents')}
                className="glass-panel p-5 text-center hover:border-emerald-500/30 transition-all cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl ${agent.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <agent.icon className={`w-6 h-6 ${agent.color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-50 mb-1">{agent.name}</h3>
                <p className="text-xs text-slate-500 leading-tight">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep About Logic */}
      <section ref={aboutRef} className="py-24 px-4 relative border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Deep About Logic</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Understanding the foundational architecture behind Africa's most intelligent waste management ecosystem.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {aboutCards.map((card, index) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel p-8 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <card.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-50 mb-4">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{card.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation Grid */}
      <section className="py-20 px-4 relative border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-50 mb-3">Platform Modules</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Enterprise-grade modules designed for every stakeholder in the waste management ecosystem.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Mission Control', path: '/dashboard', icon: BarChart3, desc: 'Real-time overview' },
              { label: 'GIS Command', path: '/gis', icon: MapPin, desc: 'Interactive mapping' },
              { label: 'Smart Bin Network', path: '/bins', icon: Trash2, desc: 'Infrastructure' },
              { label: 'Fleet Command', path: '/fleet', icon: Truck, desc: 'Vehicle tracking' },
              { label: 'Telemetry', path: '/telemetry', icon: Radio, desc: 'Edge devices' },
              { label: 'Agent Cluster', path: '/agents', icon: Brain, desc: 'AI systems' },
              { label: 'Citizen Portal', path: '/citizen', icon: Users, desc: 'Public reporting' },
              { label: 'Sustainability', path: '/sustainability', icon: TreePine, desc: 'ESG analytics' },
            ].map((item, index) => (
              <motion.button key={item.path} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                className="glass-panel p-5 text-left hover:border-emerald-500/30 transition-all duration-300 group">
                <item.icon className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-slate-50 mb-1">{item.label}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
