create or replace function public.distinct_price_brands()
returns table(brand text)
language sql
stable
set search_path = public
as $$
  select distinct p.brand
  from public.prices p
  where p.brand is not null and p.brand <> 'Inconnu';
$$;

grant execute on function public.distinct_price_brands() to anon, authenticated, service_role;