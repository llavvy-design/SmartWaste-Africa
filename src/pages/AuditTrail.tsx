import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuditLogs } from '../hooks/useSwanData';
import { Shield, Clock, User, FileText, Search, Filter } from 'lucide-react';

export default function AuditTrail() {
  const { data: logs, loading } = useAuditLogs(100);
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const matchesSearch = !filter || JSON.stringify(log).toLowerCase().includes(filter.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Audit Trail</h1>
          <p className="text-slate-400">Complete action history and system event log</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search audit logs..."
              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Actions</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user_id ? log.user_id.slice(0, 8) : 'System'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Shield className="w-3 h-3" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">
                          {log.entity_type} — {log.entity_id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 font-mono">
                          <FileText className="w-3 h-3 inline mr-1" />
                          {JSON.stringify(log.details).slice(0, 60)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
