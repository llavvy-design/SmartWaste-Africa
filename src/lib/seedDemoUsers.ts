/**
 * Demo User Seeding Script
 *
 * This script creates all 6 demo accounts with correct roles.
 * Password for all demo accounts: Demo@2024
 *
 * To use: Import and call seedDemoUsers() from the browser console or a one-time script.
 */

import { supabase } from './supabase';

export const DEMO_USERS = [
  { email: 'citizen@smartwaste.africa', password: 'Demo@2024', role: 'citizen', full_name: 'Jane Wanjiku (Demo Citizen)' },
  { email: 'contractor@smartwaste.africa', password: 'Demo@2024', role: 'contractor', full_name: 'Peter Ochieng (Demo Contractor)' },
  { email: 'dispatcher@smartwaste.africa', password: 'Demo@2024', role: 'dispatcher', full_name: 'Mary Njeri (Demo Dispatcher)' },
  { email: 'admin@smartwaste.africa', password: 'Demo@2024', role: 'municipal_admin', full_name: 'John Mutua (Demo Admin)' },
  { email: 'executive@smartwaste.africa', password: 'Demo@2024', role: 'executive', full_name: 'Dr. Sarah Kipchoge (Demo Executive)' },
  { email: 'superadmin@smartwaste.africa', password: 'Demo@2024', role: 'super_admin', full_name: 'System Administrator (Demo)' },
];

export async function seedDemoUsers() {
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const userData of DEMO_USERS) {
    try {
      // Check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingProfile) {
        // Update role if needed
        if (existingProfile.role !== userData.role) {
          await supabase
            .from('profiles')
            .update({ role: userData.role, full_name: userData.full_name })
            .eq('id', existingProfile.id);
          results.push({ email: userData.email, success: true });
        } else {
          results.push({ email: userData.email, success: true });
        }
        continue;
      }

      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        // If user already exists in auth but not profile, try to create profile
        if (authError.message.includes('already registered')) {
          // Sign in to get user ID
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
          });

          if (signInData.user) {
            await supabase.from('profiles').upsert({
              id: signInData.user.id,
              email: userData.email,
              role: userData.role,
              full_name: userData.full_name,
              account_status: 'active',
            });
            results.push({ email: userData.email, success: true });
            await supabase.auth.signOut();
            continue;
          }
        }
        results.push({ email: userData.email, success: false, error: authError.message });
        continue;
      }

      if (authData.user) {
        // Profile is created via trigger or manually
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name,
          account_status: 'active',
          password_change_required: false,
        });

        if (profileError) {
          results.push({ email: userData.email, success: false, error: profileError.message });
        } else {
          results.push({ email: userData.email, success: true });
        }
      }
    } catch (err) {
      results.push({ email: userData.email, success: false, error: String(err) });
    }
  }

  return results;
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).seedDemoUsers = seedDemoUsers;
  (window as any).DEMO_USERS = DEMO_USERS;
}
