#!/usr/bin/env tsx
/**
 * InfoEau Hardening Check Script
 * Standalone script to verify security hardening
 */

const BASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_DASHBOARD_TOKEN;

async function runHardenCheck() {
  if (!ADMIN_TOKEN) {
    console.error('❌ ADMIN_DASHBOARD_TOKEN non défini');
    process.exit(1);
  }

  try {
    const response = await fetch(`${BASE_URL}/functions/v1/admin-security-hardening`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
      }
    });

    const data = await response.json();
    
    console.log('🔒 InfoEau Hardening Check');
    console.log('===========================');
    console.log(`Status: ${data.ok ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Message: ${data.message}`);
    
    if (data.tests) {
      console.log('\nDétails:');
      data.tests.forEach((test: any) => {
        console.log(`  ${test.test}: ${test.status} - ${test.message}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

runHardenCheck();