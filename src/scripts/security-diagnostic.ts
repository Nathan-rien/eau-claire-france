#!/usr/bin/env tsx
/**
 * InfoEau Security Diagnostic Script
 * Analyse complète des tests de sécurité et rapport détaillé
 */

const BASE_URL = 'https://xblogttmomuogdhmaztf.supabase.co/functions/v1';
const ADMIN_TOKEN = 'Kerlann10210789!';

interface SecurityTest {
  name: string;
  endpoint: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  message: string;
  details?: any;
}

async function callSecurityEndpoint(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8'
      }
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 500, error: error.message };
  }
}

async function runSecurityDiagnostic(): Promise<SecurityTest[]> {
  console.log('🔒 InfoEau - Diagnostic de Sécurité Complet');
  console.log('=============================================\n');

  const tests: SecurityTest[] = [];

  // Test 1: Vérification ENV Helper
  console.log('1️⃣ Test ENV Helper...');
  const envResult = await callSecurityEndpoint('admin-security-env-status');
  if (envResult.ok) {
    const envStatus = envResult.data.envStatus || [];
    const failedVars = envStatus.filter((env: any) => env.isRequired && !env.isDefined);
    
    tests.push({
      name: 'ENV Helper',
      endpoint: 'admin-security-env-status',
      status: failedVars.length === 0 ? 'PASS' : 'FAIL',
      message: failedVars.length === 0 
        ? 'Toutes les variables requises sont définies' 
        : `${failedVars.length} variables manquantes: ${failedVars.map((v: any) => v.name).join(', ')}`,
      details: envStatus
    });
  } else {
    tests.push({
      name: 'ENV Helper',
      endpoint: 'admin-security-env-status',
      status: 'FAIL',
      message: `Erreur d'accès: ${envResult.status}`,
      details: envResult.error
    });
  }

  // Test 2: Ping Edge
  console.log('2️⃣ Test Ping Edge...');
  const pingResult = await callSecurityEndpoint('admin-security-ping');
  tests.push({
    name: 'Ping Edge',
    endpoint: 'admin-security-ping',
    status: pingResult.ok ? 'PASS' : 'FAIL',
    message: pingResult.ok 
      ? 'Connexion Edge Functions OK' 
      : `Échec connexion: ${pingResult.status}`,
    details: pingResult.data || pingResult.error
  });

  // Test 3: Echo Admin Token
  console.log('3️⃣ Test Echo Admin Token...');
  const echoResult = await callSecurityEndpoint('admin-security-echo');
  tests.push({
    name: 'Echo Admin Token',
    endpoint: 'admin-security-echo',
    status: echoResult.ok ? 'PASS' : 'FAIL',
    message: echoResult.ok 
      ? 'Authentification admin OK' 
      : `Échec authentification: ${echoResult.status}`,
    details: echoResult.data || echoResult.error
  });

  // Test 4: Vérification RLS
  console.log('4️⃣ Test Vérification RLS...');
  const rlsResult = await callSecurityEndpoint('admin-security-rls');
  if (rlsResult.ok && rlsResult.data.tests) {
    const rlsTests = rlsResult.data.tests;
    const failedRLS = rlsTests.filter((test: any) => test.status !== 'PASS');
    
    tests.push({
      name: 'Vérification RLS',
      endpoint: 'admin-security-rls',
      status: failedRLS.length === 0 ? 'PASS' : (failedRLS.length < rlsTests.length ? 'WARNING' : 'FAIL'),
      message: failedRLS.length === 0 
        ? 'Toutes les politiques RLS fonctionnent' 
        : `${failedRLS.length}/${rlsTests.length} tests RLS échoués`,
      details: rlsTests
    });
  } else {
    tests.push({
      name: 'Vérification RLS',
      endpoint: 'admin-security-rls',
      status: 'FAIL',
      message: `Erreur test RLS: ${rlsResult.status}`,
      details: rlsResult.error
    });
  }

  return tests;
}

function generateReport(tests: SecurityTest[]): void {
  console.log('\n📊 RAPPORT DE SÉCURITÉ DÉTAILLÉ');
  console.log('================================\n');

  const passed = tests.filter(t => t.status === 'PASS').length;
  const total = tests.length;
  const overallStatus = passed === total ? 'SÉCURISÉ' : passed > total/2 ? 'ATTENTION' : 'CRITIQUE';

  console.log(`🎯 Statut Général: ${overallStatus} (${passed}/${total} tests réussis)\n`);

  tests.forEach((test, index) => {
    const statusIcon = {
      'PASS': '✅',
      'WARNING': '⚠️',
      'FAIL': '❌',
      'PENDING': '⏳'
    }[test.status];

    console.log(`${index + 1}. ${statusIcon} ${test.name}`);
    console.log(`   Status: ${test.status}`);
    console.log(`   Message: ${test.message}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    
    if (test.details && test.status !== 'PASS') {
      console.log(`   Détails: ${JSON.stringify(test.details, null, 2)}`);
    }
    console.log('');
  });

  // Recommandations
  console.log('💡 RECOMMANDATIONS:');
  console.log('===================');
  
  const failedTests = tests.filter(t => t.status === 'FAIL');
  if (failedTests.length === 0) {
    console.log('✅ Aucune action requise - Tous les tests de sécurité passent');
  } else {
    failedTests.forEach(test => {
      switch (test.name) {
        case 'ENV Helper':
          console.log('🔧 Vérifier les variables d\'environnement manquantes dans .env');
          break;
        case 'Ping Edge':
          console.log('🔧 Vérifier la connectivité aux Edge Functions');
          break;
        case 'Echo Admin Token':
          console.log('🔧 Vérifier la validité du token admin');
          break;
        case 'Vérification RLS':
          console.log('🔧 Réviser les politiques RLS dans la base de données');
          break;
      }
    });
  }
}

async function main() {
  try {
    const tests = await runSecurityDiagnostic();
    generateReport(tests);
    
    const failedCount = tests.filter(t => t.status === 'FAIL').length;
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { runSecurityDiagnostic, generateReport };