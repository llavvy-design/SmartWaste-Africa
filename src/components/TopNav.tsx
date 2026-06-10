import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCounty } from '../context/CountyContext';
import { useCounties, useNotifications } from '../hooks/useSwanData';
import {
  ChevronDown, MapPin, Recycle, Bell, User, LogOut, Settings, Crown, Sparkles
} from 'lucide-react';
import { useState } from 'react';

const demoRoles = [
  { id: 'citizen', label: 'Citizen', color: 'bg-emerald-500', desc: 'Report issues, request pickups', dashboard: '/citizen' },
  { id: 'contractor', label: 'Contractor', color: 'bg-blue-500', desc: 'Execute collection routes', dashboard: '/contractor' },
  { id: 'dispatcher', label: 'Dispatcher', color: 'bg-violet-500', desc: 'Coordinate operations', dashboard: '/dispatcher' },
  { id: 'admin', label: 'Admin', color: 'bg-amber-500', desc: 'Manage county operations', dashboard: '/admin' },
  { id: 'executive', label: 'Executive', color: 'bg-teal-500', desc: 'View analytics and reports', dashboard: '/executive' },
  { id: 'superadmin', label: 'Super Admin', color: 'bg-red-500', desc: 'Full platform control', dashboard: '/superadmin' },
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

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCounty, setSelectedCounty } = useCounty();
  const { data: counties } = useCounties();
  const { user, profile, isAuthenticated, signOut, hasRole, isDemo, effectiveRole, setDemoRole, clearDemoRole } = useAuth();
  const { data: notifications } = useNotifications(user?.id, 20);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleSwitch = (role: string) => {
    const roleConfig = demoRoles.find(r => r.id === role);
    setDemoRole(role);
    setShowRoleSwitcher(false);
    navigate(roleConfig?.dashboard || '/dashboard');
  };

  const role = effectiveRole || profile?.role || '';

  const navLinks = getNavLinksForRole(role, hasRole);

  return (
    <>
      {/* Demo Mode Banner */}
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border-b border-amber-500/30"
          >
            <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-300 font-medium">Demo Mode Active</span>
                <span className="text-xs text-amber-400/70">— Viewing as <span className="font-bold capitalize">{role.replace('_', ' ')}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                >
                  <Crown className="w-3 h-3" /> Switch Role
                </button>
                <button
                  onClick={clearDemoRole}
                  className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Exit Demo
                </button>
              </div>
            </div>
            {showRoleSwitcher && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border-b border-slate-700 px-4 lg:px-6 py-3"
              >
                <div className="max-w-[1800px] mx-auto">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {demoRoles.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleRoleSwitch(r.id)}
                        className={`p-2 rounded-lg border transition-all text-left ${
                          effectiveRole === r.id
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${r.color}`} />
                          <span className="text-xs font-medium text-slate-300">{r.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50"
      >
        <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-slate-900" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm lg:text-base font-bold tracking-tight text-slate-50">SmartWaste Africa</span>
                <span className="text-emerald-400 font-bold text-sm lg:text-base ml-1">Nexus</span>
              </div>
            </div>

            {/* County Selector (only for multi-county roles) */}
            {hasRole(['dispatcher', 'municipal_admin', 'super_admin', 'executive']) && (
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
            )}

            {/* Navigation Links */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`nav-link text-xs px-2 py-1.5 transition-colors ${
                    location.pathname === link.path ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden btn-secondary text-xs"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              Menu
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Demo Mode Button for admins */}
              {isAuthenticated && !isDemo && hasRole(['municipal_admin', 'super_admin']) && (
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="hidden lg:flex items-center gap-1 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Crown className="w-3 h-3" /> Demo Mode
                </button>
              )}

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
                    <span className="text-[10px] text-slate-500 uppercase hidden xl:block">{roleLabels[role] || role}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute top-full mt-1 right-0 z-50 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-700/50">
                        <div className="text-xs text-slate-400">{profile?.email}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{roleLabels[role] || role}</div>
                      </div>
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
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="xl:hidden py-4 border-t border-slate-700/50"
              >
                <div className="flex flex-wrap gap-1 mb-3">
                  {navLinks.map((link) => (
                    <button key={link.path} onClick={() => { navigate(link.path); setShowMobileMenu(false); }}
                      className={`px-3 py-1.5 rounded text-sm ${location.pathname === link.path ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:bg-slate-800'}`}>
                      {link.label}
                    </button>
                  ))}
                </div>
                {isAuthenticated && (
                  <div className="border-t border-slate-700/50 mt-3 pt-3">
                    <button onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">Profile</button>
                    <button onClick={() => { signOut(); setShowMobileMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg">Sign Out</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Role Switcher Modal */}
      <AnimatePresence>
        {showRoleSwitcher && !isDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowRoleSwitcher(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Demo Mode</h3>
                  <p className="text-xs text-slate-400">Experience the platform from different user perspectives</p>
                </div>
                <button
                  onClick={() => setShowRoleSwitcher(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoRoles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSwitch(r.id)}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                      <span className="text-sm font-medium text-slate-300">{r.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-4 text-center">
                Your actual permissions remain unchanged. This is for demonstration purposes only.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getNavLinksForRole(role: string, hasRole: (roles: string[]) => boolean) {
  const links: { path: string; label: string }[] = [];
  const normalizedRole = role === 'superadmin' ? 'super_admin' :
                          role === 'admin' ? 'municipal_admin' : role;

  // Citizen navigation
  if (normalizedRole === 'citizen') {
    links.push({ path: '/citizen', label: 'My Reports' });
    links.push({ path: '/reports', label: 'Reports' });
    return links;
  }

  // Contractor navigation
  if (normalizedRole === 'contractor') {
    links.push({ path: '/contractor', label: 'My Routes' });
    links.push({ path: '/reports', label: 'Reports' });
    return links;
  }

  // Dispatcher navigation
  if (normalizedRole === 'dispatcher') {
    links.push({ path: '/dispatcher', label: 'Dispatch' });
    links.push({ path: '/incidents', label: 'Incidents' });
    links.push({ path: '/fleet', label: 'Fleet' });
    links.push({ path: '/bins', label: 'Bins' });
    links.push({ path: '/telemetry', label: 'Telemetry' });
    links.push({ path: '/gis', label: 'GIS' });
    return links;
  }

  // Municipal Admin navigation
  if (normalizedRole === 'municipal_admin') {
    links.push({ path: '/admin', label: 'Dashboard' });
    links.push({ path: '/users', label: 'Users' });
    links.push({ path: '/incidents', label: 'Incidents' });
    links.push({ path: '/fleet', label: 'Fleet' });
    links.push({ path: '/bins', label: 'Bins' });
    links.push({ path: '/audit', label: 'Audit' });
    links.push({ path: '/reports', label: 'Reports' });
    return links;
  }

  // Executive navigation
  if (normalizedRole === 'executive') {
    links.push({ path: '/executive', label: 'Overview' });
    links.push({ path: '/sustainability', label: 'Sustainability' });
    links.push({ path: '/digital-twin', label: 'Digital Twin' });
    links.push({ path: '/reports', label: 'Reports' });
    return links;
  }

  // Super Admin navigation
  if (normalizedRole === 'super_admin') {
    links.push({ path: '/superadmin', label: 'Console' });
    links.push({ path: '/users', label: 'Users' });
    links.push({ path: '/permissions', label: 'Permissions' });
    links.push({ path: '/audit', label: 'Audit' });
    links.push({ path: '/settings', label: 'Settings' });
    links.push({ path: '/agents', label: 'Agents' });
    return links;
  }

  return links;
}
