-- Create demo citizen user via auth system
-- This uses SQL to directly create the auth user and profile

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'citizen@smartwaste.africa';
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User already exists with ID: %', v_user_id;
  ELSE
    -- Create auth user using auth.users table
    -- Note: In production, use Supabase admin API. This is a demo approach.
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      email_change_token_new,
      email_change,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'citizen@smartwaste.africa',
      crypt('Demo@2024', gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Jane Wanjiku (Demo Citizen)","role":"citizen"}',
      false
    ) RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Created auth user with ID: %', v_user_id;
  END IF;
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
    RAISE NOTICE 'Profile already exists for user ID: %', v_user_id;
  ELSE
    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      phone,
      avatar_url,
      county_id,
      city_id,
      role,
      status,
      account_status,
      is_demo,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      'citizen@smartwaste.africa',
      'Jane Wanjiku (Demo Citizen)',
      '+254700000000',
      'https://ui-avatars.com/api/?name=Jane+Wanjiku+%28Demo+Citizen%29&background=10b981&color=fff',
      NULL,
      NULL,
      'citizen',
      'active',
      'active',
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Created profile for user ID: %', v_user_id;
  END IF;
END $$;