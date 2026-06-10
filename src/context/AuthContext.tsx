import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  county_id: string | null;
  city_id: string | null;
  subcounty_id: string | null;
  role: string;
  status: string;
  account_status: string;
  is_demo: boolean;
  demo_role: string;
  organization: string;
  department: string;
  invited_by: string | null;
  invited_at: string | null;
  last_login_at: string | null;
  password_change_required: boolean;
  login_count: number;
  notification_preferences: Record<string, boolean>;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  role: string;
  isAuthenticated: boolean;
  isDemo: boolean;
  effectiveRole: string;
  hasRole: (target: string | string[]) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string, countyId?: string, role?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  createUser: (userData: { email: string; password: string; full_name: string; phone: string; role: string; county_id?: string; subcounty_id?: string; organization?: string; department?: string }) => Promise<{ error: string | null; data?: Profile }>;
  setDemoRole: (role: string) => void;
  clearDemoRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  role: '',
  isAuthenticated: false,
  isDemo: false,
  effectiveRole: '',
  hasRole: () => false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
  createUser: async () => ({ error: null }),
  setDemoRole: () => {},
  clearDemoRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoRole, setDemoRoleState] = useState<string>('');

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data && !error) {
      const p = data as Profile;
      setProfile(p);
      // Track login
      await supabase.from('profiles').update({
        last_login_at: new Date().toISOString(),
        login_count: (p.login_count || 0) + 1,
      }).eq('id', userId);
      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'user_login',
        entity_type: 'profiles',
        entity_id: userId,
        details: { role: p.role, account_status: p.account_status },
      });
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, countyId?: string, role?: string): Promise<{ error: string | null }> => {
    const assignedRole = role || 'citizen';
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role: assignedRole,
        status: 'active',
        account_status: 'active',
        county_id: countyId || null,
        password_change_required: false,
        is_demo: true,
        demo_role: assignedRole,
      });
      const dashboardRoutes: Record<string, string> = {
        citizen: '/citizen',
        contractor: '/contractor',
        dispatcher: '/dispatcher',
        admin: '/admin',
        executive: '/executive',
        superadmin: '/superadmin',
      };
      await supabase.from('notifications').insert({
        user_id: data.user.id,
        title: 'Welcome to SmartWaste Africa Nexus',
        body: `Your ${assignedRole} account has been created. You can now access your dashboard.`,
        type: 'success',
        action_url: dashboardRoutes[assignedRole] || '/citizen',
      });
      await supabase.from('audit_logs').insert({
        user_id: data.user.id,
        action: 'user_registered',
        entity_type: 'profiles',
        entity_id: data.user.id,
        details: { role: assignedRole, email, county_id: countyId },
      });
      await fetchProfile(data.user.id);
    }
    return { error: null };
  };

  const createUser = async (userData: { email: string; password: string; full_name: string; phone: string; role: string; county_id?: string; subcounty_id?: string; organization?: string; department?: string }): Promise<{ error: string | null; data?: Profile }> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    if (authError) return { error: authError.message };
    if (authData.user) {
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        status: 'active',
        account_status: 'active',
        county_id: userData.county_id || null,
        organization: userData.organization || '',
        department: userData.department || '',
        password_change_required: true,
        invited_by: user?.id || null,
        invited_at: new Date().toISOString(),
      };
      const { data: profileResult, error: profileError } = await supabase.from('profiles').insert(profileData).select().single();
      if (profileError) return { error: profileError.message };
      await supabase.from('notifications').insert({
        user_id: authData.user.id,
        title: 'Account Invitation',
        body: `You have been invited to join SmartWaste Africa Nexus as a ${userData.role}. Please sign in and change your password.`,
        type: 'info',
      });
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: 'user_created',
        entity_type: 'profiles',
        entity_id: authData.user.id,
        details: { role: userData.role, email: userData.email, created_by: user?.id },
      });
      return { error: null, data: profileResult as Profile };
    }
    return { error: 'User creation failed' };
  };

  const signOut = async () => {
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'user_logout',
        entity_type: 'profiles',
        entity_id: user.id,
        details: { role: profile?.role },
      });
    }
    setDemoRoleState('');
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) await fetchProfile(user.id);
    return { error: error?.message ?? null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const setDemoRole = (role: string) => {
    setDemoRoleState(role);
  };

  const clearDemoRole = () => {
    setDemoRoleState('');
  };

  const hasRole = (target: string | string[]) => {
    const targets = Array.isArray(target) ? target : [target];
    if (targets.includes('all')) return true;
    const userRole = profile?.role || '';
    const effective = demoRole || userRole;
    // Normalize role names
    const normalizedRole = effective === 'superadmin' ? 'super_admin' :
                           effective === 'admin' ? 'municipal_admin' : effective;
    if (normalizedRole === 'super_admin') return true;
    return targets.some(t => {
      const normalized = t === 'superadmin' ? 'super_admin' :
                         t === 'admin' ? 'municipal_admin' : t;
      return normalized === normalizedRole;
    });
  };

  const effectiveRole = demoRole || profile?.role || '';
  const isDemo = !!demoRole;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        role: profile?.role || '',
        isAuthenticated: !!user && !!profile,
        isDemo,
        effectiveRole,
        hasRole,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
        createUser,
        setDemoRole,
        clearDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
