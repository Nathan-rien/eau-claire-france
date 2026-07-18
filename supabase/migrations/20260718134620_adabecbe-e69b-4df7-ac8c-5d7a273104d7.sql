
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previous schedule with the same name
DO $$
BEGIN
  PERFORM cron.unschedule('submit-sitemap-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'submit-sitemap-daily',
  '0 3 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://xblogttmomuogdhmaztf.supabase.co/functions/v1/submit-sitemap',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $cron$
);
