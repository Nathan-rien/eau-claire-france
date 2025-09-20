-- Create the view for latest prices per product (idempotent)
create or replace view public.prices_history_last as
select distinct on (retailer_id, coalesce(brand,'Inconnu'), product_name, total_volume_l, pack_count)
  *
from public.prices_history
order by retailer_id, coalesce(brand,'Inconnu'), product_name, total_volume_l, pack_count, scraped_at desc;

-- Create indexes for performance (idempotent)
create index if not exists idx_ph_last_scraped on public.prices_history(scraped_at);
create index if not exists idx_ph_last_retailer_brand on public.prices_history(retailer_id, brand);