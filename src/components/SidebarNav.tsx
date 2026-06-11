import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCounty } from '../context/CountyContext';
import { useCounties, useNotifications } from '../hooks/useSwanData';
import {
  Recycle, Home, MapPin, Bell, User, LogOut, Settings, ChevronLeft, ChevronRight,
  MessageSquare, Truck, Trash2, Activity, BarChart3, FileText, Users, Shield,
  AlertTriangle, Building2, TrendingUp, Globe, Cpu, Menu, X, Search, ChevronDown
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  badge?: number;
}

const allNavItems: NavItem[] = [
  { path: '/citizen', label: 'My Dashboard', icon: Home, roles: ['citizen'] },
  { path: '/citizen', label: 'Submit Report', icon: MessageSquare, roles: ['citizen'] },
  { path: '/reports', label: 'My Reports', icon: FileText, roles: ['citizen'] },

  { path: '/contractor', label: 'Dashboard', icon: Home, roles: ['contractor'] },
  { path: '/contractor', label: 'My Routes', icon: Truck, roles: ['contractor'] },
  { path: '/fleet', label: 'Fleet Status', icon: Truck, roles: ['contractor'] },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle, roles: ['contractor'] },

  { path: '/dispatcher', label: 'Dashboard', icon: Home, roles: ['dispatcher'] },
  { path: '/dispatcher', label: 'Dispatch Queue', icon: Activity, roles: ['dispatcher'] },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle, roles: ['dispatcher'] },
  { path: '/fleet', label: 'Fleet', icon: Truck, roles: ['dispatcher'] },
  { path: '/bins', label: 'Smart Bins', icon: Trash2, roles: ['dispatcher'] },
  { path: '/telemetry', label: 'Telemetry', icon: Cpu, roles: ['dispatcher'] },
  { path: '/gis', label: 'GIS Center', icon: MapPin, roles: ['dispatcher'] },

  { path: '/admin', label: 'Dashboard', icon: Home, roles: ['admin', 'municipal_admin'] },
  { path: '/admin', label: 'Operations', icon: Building2, roles: ['admin', 'municipal_admin'] },
  { path: '/users', label: 'User Management', icon: Users, roles: ['admin', 'municipal_admin'] },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle, roles: ['admin', 'municipal_admin'] },
  { path: '/fleet', label: 'Fleet', icon: Truck, roles: ['admin', 'municipal_admin'] },
  { path: '/bins', label: 'Smart Bins', icon: Trash2, roles: ['admin', 'municipal_admin'] },
  { path: '/sustainability', label: 'Sustainability', icon: TrendingUp, roles: ['admin', 'municipal_admin'] },
  { path: '/audit', label: 'Audit Trail', icon: Shield, roles: ['admin', 'municipal_admin'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'municipal_admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'municipal_admin'] },

  { path: '/executive', label: 'Overview', icon: Home, roles: ['executive'] },
  { path: '/sustainability', label: 'Sustainability', icon: TrendingUp, roles: ['executive'] },
  { path: '/digital-twin', label: 'Digital Twin', icon: Globe, roles: ['executive'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['executive'] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['executive'] },

  { path: '/superadmin', label: 'Console', icon: Home, roles: ['superadmin', 'super_admin'] },
  { path: '/superadmin', label: 'System Health', icon: Activity, roles: ['superadmin', 'super_admin'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['superadmin', 'super_admin'] },
  { path: '/permissions', label: 'Permissions', icon: Shield, roles: ['superadmin', 'super_admin'] },
  { path: '/audit', label: 'Audit Trail', icon: FileText, roles: ['superadmin', 'super_admin'] },
  { path: '/agents', label: 'AI Agents', icon: Cpu, roles: ['superadmin', 'super_admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['superadmin', 'super_admin'] },
];

const roleLabels: Record<string, string> = {
  citizen: 'Citizen',
  contractor: 'Contractor',
  dispatcher: 'Dispatcher',
  admin: 'Municipal Admin',
  municipal_admin: 'Municipal Admin',
  executive: 'Executive',
  superadmin: 'Super Admin',
  super_admin: 'Super Admin',
};

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, effectiveRole, hasRole } = useAuth();
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { data: notifications } = useNotifications(user?.id, 20);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const normalizedRole = effectiveRole === 'superadmin' ? 'super_admin' :
                          effectiveRole === 'admin' ? 'municipal_admin' : effectiveRole;

  const navItems = allNavItems.filter(item => {
    const itemRoles = item.roles.map(r => r === 'superadmin' ? 'super_admin' : r === 'admin' ? 'municipal_admin' : r);
    return itemRoles.includes(normalizedRole) || itemRoles.includes('all');
  });

  const uniqueItems = navItems.filter((item, index, self) =>
    index === self.findIndex(i => i.path === item.path)
  );

  const filteredItems = searchQuery
    ? uniqueItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : uniqueItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-emerald-500 rounded-full shadow-lg text-slate-900 hover:bg-emerald-400 transition-colors"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-700/50 transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>

          {/* Search */}
          {!collapsed && (
            <div className="p-3 border-b border-slate-700/30">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* County Selector for multi-county roles */}
          {hasRole(['dispatcher', 'municipal_admin', 'super_admin', 'executive', 'admin', 'superadmin']) && !collapsed && (
            <div className="p-3 border-b border-slate-700/30 relative">
              <button
                onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs hover:border-slate-600 transition-colors"
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300 truncate">{selectedCounty?.name || 'All Counties'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />
              </button>
              {showCountyDropdown && (
                <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedCounty(null); setShowCountyDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    All Counties
                  </button>
                  {counties.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCounty(c); setShowCountyDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${
                        selectedCounty?.id === c.id ? 'text-emerald-400 bg-slate-700/50' : 'text-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredItems.map(item => (
                <button
                  key={`${item.path}-${item.label}`}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive(item.path) ? 'text-emerald-400' : ''}`} />
                  {!collapsed && (
                    <>
                      <span className="text-sm truncate">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-700/50 p-2">
            {!collapsed ? (
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] font-bold text-slate-900 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Role Badge */}
          {!collapsed && (
            <div className="p-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 text-center">
                {roleLabels[effectiveRole] || effectiveRole}
              </div>
              {profile?.email && (
                <div className="text-xs text-slate-600 text-center truncate mt-1">
                  {profile.email}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-700 z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Recycle className="w-4 h-4 text-slate-900" />
                  </div>
                  <span className="font-bold text-slate-50">SmartWaste</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
                  />
                </div>
              </div>

              <nav className="px-3 pb-3">
                <div className="space-y-1">
                  {filteredItems.map(item => (
                    <button
                      key={`${item.path}-${item.label}`}
                      onClick={() => { navigate(item.path); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              <div className="border-t border-slate-700 p-3 space-y-1">
                <button
                  onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => { navigate('/notifications'); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-emerald-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>

              <div className="p-3 border-t border-slate-700">
                <div className="text-xs text-slate-500 text-center">
                  {roleLabels[effectiveRole] || effectiveRole}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for main content */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`} />
    </>
  );
}
