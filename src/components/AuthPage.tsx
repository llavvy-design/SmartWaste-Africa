import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Recycle, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Loader2, ChevronDown, Users } from 'lucide-react';

const ROLES = [
  { id: 'citizen', label: 'Citizen', description: 'Report issues, track services' },
  { id: 'contractor', label: 'Contractor', description: 'Manage waste collection routes' },
  { id: 'dispatcher', label: 'Dispatcher', description: 'Coordinate fleet operations' },
  { id: 'admin', label: 'Municipal Admin', description: 'Manage county waste systems' },
  { id: 'executive', label: 'Executive', description: 'View analytics and reports' },
  { id: 'superadmin', label: 'Super Admin', description: 'Full system administration' },
];

const DEMO_ACCOUNTS = [
  { email: 'citizen@smartwaste.africa', password: 'Demo@2024', role: 'citizen' },
  { email: 'contractor@smartwaste.africa', password: 'Demo@2024', role: 'contractor' },
  { email: 'dispatcher@smartwaste.africa', password: 'Demo@2024', role: 'dispatcher' },
  { email: 'admin@smartwaste.africa', password: 'Demo@2024', role: 'admin' },
  { email: 'executive@smartwaste.africa', password: 'Demo@2024', role: 'executive' },
  { email: 'superadmin@smartwaste.africa', password: 'Demo@2024', role: 'superadmin' },
];

export default function AuthPage() {
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate(from);
    } else {
      if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName, phone, undefined, selectedRole);
      if (error) setError(error);
      else navigate(from);
    }
    setLoading(false);
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setError('');
    setLoading(true);
    setEmail(account.email);
    setPassword(account.password);
    const { error } = await signIn(account.email, account.password);
    if (error) {
      setError(`Demo account not yet available. Error: ${error}`);
    } else {
      navigate(from);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Recycle className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-50">SmartWaste Africa Nexus</h1>
          <p className="text-sm text-slate-400 mt-1">Smart City Waste Intelligence Platform</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${mode === 'signin' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 border-b border-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${mode === 'signup' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 border-b border-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (e.g., +254 7XX XXX XXX)"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.label} - {r.description}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:border-emerald-500 outline-none"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {mode === 'signin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 glass-panel p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account)}
                  disabled={loading}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="text-xs font-medium text-emerald-400 capitalize">{account.role}</div>
                  <div className="text-xs text-slate-500 truncate">{account.email}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">Password for all demo accounts: Demo@2024</p>
          </motion.div>
        )}

        <p className="text-center text-xs text-slate-600 mt-6">
          By using this platform, you agree to the municipal waste management terms.
        </p>
      </motion.div>
    </div>
  );
}
