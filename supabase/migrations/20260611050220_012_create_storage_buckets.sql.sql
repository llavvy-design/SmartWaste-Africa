-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('incident-photos', 'incident-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('report-attachments', 'report-attachments', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('proof-of-service', 'proof-of-service', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('profile-avatars', 'profile-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for incident-photos bucket
CREATE POLICY "Users can upload incident photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'incident-photos');

CREATE POLICY "Users can view incident photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'incident-photos');

-- RLS policies for report-attachments bucket
CREATE POLICY "Users can upload report attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'report-attachments');

CREATE POLICY "Users can view report attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'report-attachments');

-- RLS policies for proof-of-service bucket
CREATE POLICY "Contractors can upload proof of service" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proof-of-service');

CREATE POLICY "Users can view proof of service" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'proof-of-service');

-- RLS policies for profile-avatars bucket (public read)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-avatars');