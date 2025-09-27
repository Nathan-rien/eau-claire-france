-- Enable required extensions for cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily admin-scrape at 02:00
SELECT cron.schedule(
  'daily-admin-scrape',
  '0 2 * * *', -- Every day at 02:00
  $$
  SELECT
    net.http_post(
        url:='https://xblogttmomuogdhmaztf.supabase.co/functions/v1/admin-scrape',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8"}'::jsonb,
        body:='{"retailers": ["carrefour", "leclerc", "intermarche"], "brands": ["evian", "cristaline", "hepar"], "formats": ["1.5L"], "maxPages": 3}'::jsonb
    ) as request_id;
  $$
);