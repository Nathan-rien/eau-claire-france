#!/usr/bin/env tsx
/**
 * InfoEau RLS Final Check Script
 * Lance le RLS Check complet après migration
 */

const BASE_URL = 'https://xblogttmomuogdhmaztf.supabase.co';
const ADMIN_TOKEN = process.env.ADMIN_DASHBOARD_TOKEN;

async function runFinalRLSCheck() {
  if (!ADMIN_TOKEN) {
    console.error('❌ ADMIN_DASHBOARD_TOKEN non défini');
    process.exit(1);
  }

  try {
    console.log('🔒 Lancement du RLS Check final...');
    
    const response = await fetch(`${BASE_URL}/functions/v1/admin-security-rls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8'
      }
    });

    if (!response.ok) {
      console.error(`❌ Erreur HTTP: ${response.status}`);
      const text = await response.text();
      console.error('Réponse:', text);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('\n🔒 RÉSULTATS RLS CHECK FINAL');
    console.log('================================');
    console.log(`Status global: ${data.ok ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Message: ${data.message || 'N/A'}`);
    
    if (data.tests && Array.isArray(data.tests)) {
      console.log('\n📋 Détails des tests:');
      data.tests.forEach((test: any, index: number) => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        console.log(`  ${index + 1}. ${test.test}: ${status}`);
        console.log(`     ${test.message || 'Aucun message'}`);
      });
    }

    if (data.summary) {
      console.log(`\n📊 Résumé: ${data.summary.passed}/${data.summary.total} tests réussis`);
    }

    // JSON complet pour debugging
    console.log('\n📄 JSON COMPLET:');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log('\n🎉 Tous les checks RLS sont PASS !');
      process.exit(0);
    } else {
      console.log('\n⚠️ Certains checks RLS ont échoué');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Erreur lors du RLS Check:', error.message);
    process.exit(1);
  }
}

runFinalRLSCheck();