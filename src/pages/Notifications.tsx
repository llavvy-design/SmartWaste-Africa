import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useSwanData';
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertTriangle,
  incident: AlertTriangle,
  dispatch: MapPin,
};

const typeColors: Record<string, string> = {
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  incident: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  dispatch: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications, refetch } = useNotifications(user?.id, 50);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    refetch();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    refetch();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    refetch();
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[900px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Notifications</h1>
              <p className="text-slate-400">Real-time alerts and system messages</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                {unreadCount} unread
              </span>
              <button onClick={markAllAsRead} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-50 transition-colors">
                Mark all read
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${filter === 'all' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${filter === 'unread' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
          >
            Unread
          </button>
        </div>

        <div className="space-y-2">
          {filtered.map((notification, index) => {
            const Icon = typeIcons[notification.type] || Info;
            const colorClass = typeColors[notification.type] || typeColors.info;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`glass-panel p-4 flex items-start gap-3 transition-all ${!notification.read ? 'border-l-2 border-l-emerald-500' : ''}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-50">{notification.title}</h3>
                    {!notification.read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{notification.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    {notification.action_url && (
                      <button
                        onClick={() => {
                          navigate(notification.action_url);
                          markAsRead(notification.id);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
