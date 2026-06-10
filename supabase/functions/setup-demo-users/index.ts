import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_USERS = [
  { email: "citizen@smartwaste.africa", password: "Demo@2024", role: "citizen", full_name: "Jane Wanjiku (Demo Citizen)" },
  { email: "contractor@smartwaste.africa", password: "Demo@2024", role: "contractor", full_name: "Peter Ochieng (Demo Contractor)" },
  { email: "dispatcher@smartwaste.africa", password: "Demo@2024", role: "dispatcher", full_name: "Mary Njeri (Demo Dispatcher)" },
  { email: "admin@smartwaste.africa", password: "Demo@2024", role: "admin", full_name: "John Kamau (Demo Admin)" },
  { email: "executive@smartwaste.africa", password: "Demo@2024", role: "executive", full_name: "Dr. Sarah Muthoni (Demo Executive)" },
  { email: "superadmin@smartwaste.africa", password: "Demo@2024", role: "superadmin", full_name: "System Admin (Demo SuperAdmin)" },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const results = [];

    for (const user of DEMO_USERS) {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", user.email)
        .single();

      if (existingProfile) {
        results.push({ email: user.email, status: "already_exists", profileId: existingProfile.id });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name, role: user.role },
      });

      if (authError) {
        // User might already exist in auth - try to find them
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers.users.find(u => u.email === user.email);

        if (existing) {
          // Create or update profile
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: existing.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: "active",
            county_id: null,
            city_id: null,
            phone: "+254700000000",
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=10b981&color=fff`,
          });

          if (profileError) {
            results.push({ email: user.email, status: "profile_error", error: profileError.message });
          } else {
            results.push({ email: user.email, status: "profile_created_for_existing_auth", userId: existing.id });
          }
        } else {
          results.push({ email: user.email, status: "auth_error", error: authError.message });
        }
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: "active",
        county_id: null,
        city_id: null,
        phone: "+254700000000",
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=10b981&color=fff`,
      });

      if (profileError) {
        results.push({ email: user.email, status: "profile_error", userId: authData.user.id, error: profileError.message });
      } else {
        results.push({ email: user.email, status: "created", userId: authData.user.id });
      }
    }

    return new Response(JSON.stringify({ success: true, results, credentials: DEMO_USERS.map(u => ({ email: u.email, password: u.password, role: u.role })) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
