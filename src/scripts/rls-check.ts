#!/usr/bin/env tsx
/**
 * InfoEau RLS Check Script
 * Standalone script to verify Row Level Security policies
 */

const BASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_DASHBOARD_TOKEN;

async function runRLSCheck() {
  if (!ADMIN_TOKEN) {
    console.error('❌ ADMIN_DASHBOARD_TOKEN non défini');
    process.exit(1);
  }

  try {
    const response = await fetch(`${BASE_URL}/functions/v1/admin-security-rls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
      }
    });

    const data = await response.json();
    
    console.log('🔒 InfoEau RLS Check');
    console.log('=====================');
    console.log(`Status: ${data.ok ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Message: ${data.message}`);
    
    if (data.tests) {
      console.log('\nDétails:');
      data.tests.forEach((test: any) => {
        console.log(`  ${test.test}: ${test.status} - ${test.message}`);
      });
    }

    if (data.summary) {
      console.log(`\nRésumé: ${data.summary.passed}/${data.summary.total} tests réussis`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

runRLSCheck();