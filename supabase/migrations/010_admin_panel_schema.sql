-- 1. Make owner_id nullable on venues (for unassigned venues)
ALTER TABLE venues ALTER COLUMN owner_id DROP NOT NULL;

-- 2. Create venue-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-photos', 'venue-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for venue-photos
CREATE POLICY "Public read for venue photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-photos');

CREATE POLICY "Authenticated upload for venue photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'venue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete for venue photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'venue-photos' AND auth.role() = 'authenticated');
