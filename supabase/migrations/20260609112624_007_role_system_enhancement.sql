/*
# Role-Based Authentication Enhancement

Enhances the user management system with:
- Account status tracking (active, pending, suspended, locked, disabled)
- Demo mode flag for capstone demonstrations
- User invitation system (created_by, invited_at)
- Last login tracking and session management
- Organization and department fields for enterprise users
- Password change requirement tracking
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS demo_role text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_change_required boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ip_address text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_agent text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": true}';

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_demo ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Insert demo users for all 6 roles
-- These will be created via the frontend edge function or seed script
