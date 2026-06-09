import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCounty } from '../context/CountyContext';
import { useCounties, useNotifications } from '../hooks/useSwanData';
import {
  ChevronDown, MapPin, Recycle, Bell, User, LogOut, Settings
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Platform',
    links: [
      { path: '/', label: 'Home' },
      { path: '/dashboard', label: 'Mission Control', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/digital-twin', label: 'Digital Twin', roles: ['executive', 'municipal_admin', 'super_admin'] },
    ],
  },
  {
    label: 'Operations',
    links: [
      { path: '/gis', label: 'GIS Command', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/bins', label: 'Smart Bin Network', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/fleet', label: 'Fleet Command', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/telemetry', label: 'Telemetry', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/agents', label: 'Agent Cluster', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
    ],
  },
  {
    label: 'Stakeholders',
    links: [
      { path: '/citizen', label: 'Citizen Portal' },
      { path: '/contractor', label: 'Contractor Portal', roles: ['contractor', 'dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/executive', label: 'Executive Portal', roles: ['executive', 'municipal_admin', 'super_admin'] },
    ],
  },
  {
    label: 'Intelligence',
    links: [
      { path: '/sustainability', label: 'Sustainability', roles: ['executive', 'municipal_admin', 'super_admin'] },
      { path: '/incidents', label: 'Incident Command', roles: ['dispatcher', 'municipal_admin', 'super_admin'] },
      { path: '/reports', label: 'Report Generator' },
    ],
  },
  {
    label: 'Admin',
    links: [
      { path: '/audit', label: 'Audit Trail', roles: ['municipal_admin', 'super_admin'] },
      { path: '/settings', label: 'System Settings', roles: ['municipal_admin', 'super_admin'] },
    ],
  },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { user, profile, isAuthenticated, signOut, hasRole } = useAuth();
  const { data: notifications } = useNotifications(user?.id, 20);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const visibleNavGroups = navGroups.map(group => ({
    ...group,
    links: group.links.filter(link => {
      if (!link.roles) return true;
      if (!isAuthenticated) return false;
      return hasRole(link.roles);
    }),
  })).filter(group => group.links.length > 0);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50"
    >
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Corporate Mark */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Recycle className="w-5 h-5 text-slate-900" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm lg:text-base font-bold tracking-tight text-slate-50">SmartWaste Africa</span>
              <span className="text-emerald-400 font-bold text-sm lg:text-base ml-1">Nexus</span>
            </div>
          </div>

          {/* County Selector */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setShowCountyDropdown(!showCountyDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">{selectedCounty?.name || 'All Counties'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {showCountyDropdown && (
              <div className="absolute top-full mt-1 left-0 z-50 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                <button onClick={() => { setSelectedCounty(null); setShowCountyDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors border-b border-slate-700">
                  All Counties (National View)
                </button>
                {counties.map((county) => (
                  <button key={county.id} onClick={() => { setSelectedCounty(county); setShowCountyDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${selectedCounty?.id === county.id ? 'text-emerald-400 bg-slate-700/50' : 'text-slate-300'}`}>
                    <div className="flex items-center justify-between">
                      <span>{county.name}</span>
                      <span className="text-xs text-slate-500">{county.region}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden xl:flex items-center gap-1">
            {visibleNavGroups.map((group) => (
              <div key={group.label} className="relative group">
                <button className="nav-link text-xs px-2 py-1.5">{group.label}</button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {group.links.map((link) => (
                    <button key={link.path} onClick={() => navigate(link.path)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${location.pathname === link.path ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="xl:hidden nav-link" onClick={() => setShowNavMenu(!showNavMenu)}>Menu</button>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-slate-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] font-bold text-slate-900 flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute top-full mt-2 right-0 z-50 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-50">Notifications</span>
                      <button onClick={() => navigate('/notifications')} className="text-xs text-emerald-400 hover:text-emerald-300">View All</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.slice(0, 5).map((n) => (
                        <div key={n.id} onClick={() => { navigate(n.action_url || '/notifications'); setShowNotifications(false); }}
                          className={`p-3 border-b border-slate-700/30 hover:bg-slate-700/50 cursor-pointer transition-colors ${!n.read ? 'border-l-2 border-l-emerald-500' : ''}`}>
                          <div className="text-sm font-medium text-slate-50">{n.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{n.body}</div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300 hidden lg:block">{profile?.full_name || user?.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-slate-500 uppercase hidden xl:block">{profile?.role}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                {showUserMenu && (
                  <div className="absolute top-full mt-1 right-0 z-50 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    {hasRole(['municipal_admin', 'super_admin']) && (
                      <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                    )}
                    <button onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2 border-t border-slate-700">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm rounded-lg transition-colors">
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {showNavMenu && (
          <div className="xl:hidden py-4 border-t border-slate-700/50">
            {visibleNavGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 mb-1">{group.label}</div>
                <div className="flex flex-wrap gap-1">
                  {group.links.map((link) => (
                    <button key={link.path} onClick={() => { navigate(link.path); setShowNavMenu(false); }}
                      className={`px-3 py-1.5 rounded text-sm ${location.pathname === link.path ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:bg-slate-800'}`}>
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {isAuthenticated && (
              <div className="border-t border-slate-700/50 mt-3 pt-3">
                <button onClick={() => { navigate('/profile'); setShowNavMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">Profile</button>
                <button onClick={() => { signOut(); setShowNavMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg">Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
}
