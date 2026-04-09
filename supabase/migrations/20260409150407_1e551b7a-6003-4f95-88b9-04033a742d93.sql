DROP POLICY "prices_history_public_select_90d" ON public.prices_history;
CREATE POLICY "prices_history_public_select"
  ON public.prices_history FOR SELECT TO public
  USING (true);