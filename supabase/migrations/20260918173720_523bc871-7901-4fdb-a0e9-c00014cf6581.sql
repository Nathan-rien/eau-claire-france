CREATE POLICY "Anyone can upload water point photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'water-points-photos');

CREATE POLICY "Anyone can read water point photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'water-points-photos');

CREATE POLICY "Admins can delete water point photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'water-points-photos' AND public.is_admin());