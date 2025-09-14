import { createClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/integrations/supabase/serviceClient';

function pass(msg: string) { console.log(`PASS: ${msg}`); }
function fail(msg: string) { console.error(`FAIL: ${msg}`); }
function info(msg: string) { console.log(`INFO: ${msg}`); }

async function main() {
  // Public (anon) client to verify RLS read access
  const SUPABASE_URL = 'https://xblogttmomuogdhmaztf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8';
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Service client for privileged checks and cleanup
  let service: ReturnType<typeof createServiceClient>;
  try {
    service = createServiceClient();
  } catch (e) {
    fail('SUPABASE_SERVICE_ROLE_KEY manquant. Ajoutez la clé service pour exécuter le diagnostic complet.');
    process.exit(2);
    return;
  }

  info('1) Comptages de base');
  const { count: retailers_count } = await anon.from('retailers').select('*', { count: 'exact', head: true });
  const { count: active_retailers_count } = await anon.from('retailers').select('*', { count: 'exact', head: true }).eq('status', 'active');
  if ((retailers_count || 0) >= 6) pass(`retailers_count = ${retailers_count}`); else fail(`retailers_count = ${retailers_count || 0} (< 6)`);
  if ((active_retailers_count || 0) >= 6) pass(`active_retailers_count = ${active_retailers_count}`); else fail(`active_retailers_count = ${active_retailers_count || 0} (< 6)`);

  const { count: prices_count } = await anon.from('prices').select('*', { count: 'exact', head: true });
  if ((prices_count || 0) > 0) pass(`prices_count = ${prices_count}`); else fail('prices_count = 0');

  const { data: lastScraped } = await anon.from('prices').select('scraped_at').order('scraped_at', { ascending: false }).limit(1);
  if (lastScraped && lastScraped[0]) pass(`last_scraped_at = ${lastScraped[0].scraped_at}`); else info('last_scraped_at = null');

  const brandsRes = await anon.functions.invoke('debug-brands');
  if (brandsRes.error) fail(`debug-brands erreur: ${brandsRes.error.message}`); else pass(`distinct_brands_count = ${(brandsRes.data as string[]).length}`);

  info('\n2) Vérification RLS (SELECT public)');
  const sel1 = await anon.from('retailers').select('*').limit(1);
  if (sel1.error) fail(`SELECT retailers KO: ${sel1.error.message}`); else pass('SELECT retailers OK');
  const sel2 = await anon.from('prices').select('*').limit(1);
  if (sel2.error) fail(`SELECT prices KO: ${sel2.error.message}`); else pass('SELECT prices OK');
  const sel3 = await anon.from('prices_history').select('*').gte('scraped_at', new Date(Date.now() - 90*24*60*60*1000).toISOString()).limit(1);
  if (sel3.error) fail(`SELECT prices_history KO: ${sel3.error.message}`); else pass('SELECT prices_history OK (90j)');

  info('\n3) Vérification RLS (écritures uniquement service role)');
  const dummyHash = `DIAG-TEST-${Date.now()}`;
  const anonInsert = await anon.from('prices').insert({
    retailer_id: '00000000-0000-0000-0000-000000000000',
    run_id: '00000000-0000-0000-0000-000000000000',
    brand: 'Inconnu',
    product_name: 'Diagnostic Dummy',
    unique_hash: dummyHash,
    scraped_at: new Date().toISOString()
  } as any);
  if (!anonInsert.error) {
    fail('INSERT prices via anon aurait dû être refusé par RLS');
  } else {
    pass('INSERT prices via anon refusé (attendu)');
  }

  const { data: anyRetailer } = await service.from('retailers').select('id').eq('status','active').limit(1).maybeSingle();
  const retailerId = anyRetailer?.id || '00000000-0000-0000-0000-000000000000';
  const serviceInsert = await service.from('prices').insert({
    retailer_id: retailerId,
    run_id: '00000000-0000-0000-0000-000000000000',
    brand: 'Inconnu',
    product_name: 'Diagnostic Service Insert',
    unique_hash: dummyHash,
    scraped_at: new Date().toISOString()
  } as any).select('id').maybeSingle();
  if (serviceInsert.error) {
    fail(`INSERT prices via service_role KO: ${serviceInsert.error.message}`);
  } else {
    pass('INSERT prices via service_role OK');
    // Clean up
    await service.from('prices').delete().eq('unique_hash', dummyHash);
  }

  info('\n4) Endpoints debug');
  const health = await anon.functions.invoke('debug-health');
  if (health.error) fail(`debug-health KO: ${health.error.message}`); else pass('debug-health OK');
  const rets = await anon.functions.invoke('debug-retailers');
  if (rets.error) fail(`debug-retailers KO: ${rets.error.message}`); else pass(`debug-retailers OK (${(rets.data as any[]).length} actifs)`);

  console.log('\nDiagnostic terminé.');
}

main().catch((e) => {
  console.error('Diagnostic error:', e);
  process.exit(1);
});