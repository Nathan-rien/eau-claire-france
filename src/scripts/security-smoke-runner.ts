#!/usr/bin/env tsx
/**
 * InfoEau Security Smoke Test Runner
 * Auto-test all security endpoints and generate RAPPORT_SÉCURITÉ.md
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface SecurityCheck {
  name: string;
  endpoint: string;
  required: boolean;
  result?: {
    ok: boolean;
    status: number;
    message: string;
    data?: any;
  };
}

const BASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_DASHBOARD_TOKEN;

const SECURITY_CHECKS: SecurityCheck[] = [
  { name: 'RLS Check', endpoint: '/functions/v1/admin-security-rls', required: true },
  { name: 'Hardening Check', endpoint: '/functions/v1/admin-security-hardening', required: true },
  { name: 'Environment Diagnostic', endpoint: '/functions/v1/admin-security-diagnostic', required: true },
  { name: 'Security Smoke Test', endpoint: '/functions/v1/admin-security-smoke', required: true },
  { name: 'Environment Sample', endpoint: '/functions/v1/admin-security-env-sample', required: false },
  { name: 'Security Alerts', endpoint: '/functions/v1/admin-security-alerts', required: false },
  { name: 'Cleanup', endpoint: '/functions/v1/admin-security-clean', required: false },
  { name: 'CRON Disable', endpoint: '/functions/v1/admin-security-cron-disable', required: true },
];

async function callSecurityEndpoint(check: SecurityCheck): Promise<void> {
  if (!ADMIN_TOKEN) {
    check.result = {
      ok: false,
      status: 0,
      message: 'ADMIN_DASHBOARD_TOKEN non défini - configurez cette variable d\'environnement'
    };
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}${check.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
      }
    });

    const data = await response.json();
    
    check.result = {
      ok: response.ok && (data.ok === true || data.pass === true),
      status: response.status,
      message: data.message || data.error || `HTTP ${response.status}`,
      data
    };

  } catch (error) {
    check.result = {
      ok: false,
      status: 0,
      message: `Erreur réseau: ${error.message}`
    };
  }
}

async function enableCronIfAllowed(allChecksPass: boolean): Promise<SecurityCheck> {
  const cronCheck: SecurityCheck = { 
    name: 'CRON Enable', 
    endpoint: '/functions/v1/admin-security-cron-enable', 
    required: false 
  };

  if (!allChecksPass) {
    cronCheck.result = {
      ok: false,
      status: 0,
      message: 'CRON non activé - certains checks de sécurité ont échoué'
    };
    return cronCheck;
  }

  await callSecurityEndpoint(cronCheck);
  return cronCheck;
}

function generateReport(checks: SecurityCheck[], cronCheck: SecurityCheck): string {
  const timestamp = new Date().toISOString();
  const allRequiredPass = checks.filter(c => c.required).every(c => c.result?.ok);
  const globalStatus = allRequiredPass ? 'PASS' : 'FAIL';

  let report = `# InfoEau - Rapport de Sécurité

**Date:** ${new Date().toLocaleString('fr-FR')}
**Statut Global:** ${globalStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}
**CRON Status:** ${cronCheck.result?.ok ? '✅ ENABLED' : '❌ DISABLED'}

## Résumé des Vérifications

`;

  // Add summary table
  checks.forEach(check => {
    const status = check.result?.ok ? '✅ PASS' : '❌ FAIL';
    const required = check.required ? ' (REQUIS)' : '';
    report += `- **${check.name}${required}:** ${status} - ${check.result?.message || 'Non testé'}\n`;
  });

  report += `- **CRON Activation:** ${cronCheck.result?.ok ? '✅ ENABLED' : '❌ DISABLED'} - ${cronCheck.result?.message}\n\n`;

  // Detailed results
  report += `## Détails des Tests\n\n`;

  checks.forEach(check => {
    report += `### ${check.name}\n`;
    report += `- **Endpoint:** ${check.endpoint}\n`;
    report += `- **Status:** ${check.result?.status || 'N/A'}\n`;
    report += `- **Résultat:** ${check.result?.ok ? 'PASS' : 'FAIL'}\n`;
    report += `- **Message:** ${check.result?.message || 'Non testé'}\n\n`;
  });

  // CRON details
  report += `### CRON Activation\n`;
  report += `- **Status:** ${cronCheck.result?.status || 'N/A'}\n`;
  report += `- **Résultat:** ${cronCheck.result?.ok ? 'ENABLED' : 'DISABLED'}\n`;
  report += `- **Message:** ${cronCheck.result?.message}\n\n`;

  if (globalStatus === 'FAIL') {
    report += `## Actions Requises\n\n`;
    const failedChecks = checks.filter(c => c.required && !c.result?.ok);
    failedChecks.forEach(check => {
      report += `- **${check.name}:** ${check.result?.message}\n`;
    });
    
    if (!ADMIN_TOKEN) {
      report += `- **Configuration:** Définir ADMIN_DASHBOARD_TOKEN dans les variables d'environnement\n`;
    }
    
    report += `\nLe CRON restera désactivé tant que tous les checks requis ne seront pas PASS.\n\n`;
  }

  report += `## Configuration Recommandée\n\n`;
  report += `Pour une configuration de production sécurisée, consultez ENV_SAMPLE.md :\n\n`;
  report += `\`\`\`bash\n`;
  report += `# Variables critiques\n`;
  report += `ADMIN_DASHBOARD_TOKEN=votre-token-securise-ici\n`;
  report += `FF_ADMIN_UI=false\n`;
  report += `FF_DEBUG_ROUTES=false\n`;
  report += `CRON_ENABLED=false  # Activé uniquement via Security Dashboard\n`;
  report += `\`\`\`\n\n`;

  report += `---\n*Rapport généré automatiquement par security-smoke-runner.ts*\n`;

  return report;
}

async function main() {
  console.log('🔒 InfoEau Security Smoke Test Runner');
  console.log('=====================================\n');

  if (!ADMIN_TOKEN) {
    console.error('❌ ERREUR: ADMIN_DASHBOARD_TOKEN non défini');
    console.error('   Définissez cette variable d\'environnement avant de continuer.\n');
    process.exit(1);
  }

  console.log('🧪 Exécution des tests de sécurité...\n');

  // Run all security checks
  for (const check of SECURITY_CHECKS) {
    process.stdout.write(`  ${check.name}... `);
    await callSecurityEndpoint(check);
    console.log(check.result?.ok ? '✅ PASS' : '❌ FAIL');
    
    if (check.required && !check.result?.ok) {
      console.log(`     └─ ${check.result?.message}`);
    }
  }

  // Check if all required tests pass
  const allRequiredPass = SECURITY_CHECKS.filter(c => c.required).every(c => c.result?.ok);
  
  console.log('\n🔄 Vérification CRON...');
  const cronCheck = await enableCronIfAllowed(allRequiredPass);
  console.log(`  CRON Status: ${cronCheck.result?.ok ? '✅ ENABLED' : '❌ DISABLED'}`);

  // Generate and save report
  const report = generateReport(SECURITY_CHECKS, cronCheck);
  const reportPath = join(process.cwd(), 'RAPPORT_SÉCURITÉ.md');
  writeFileSync(reportPath, report, 'utf8');

  console.log('\n📊 Résultats:');
  console.log(`  Status Global: ${allRequiredPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  CRON: ${cronCheck.result?.ok ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`  Rapport sauvegardé: RAPPORT_SÉCURITÉ.md\n`);

  if (!allRequiredPass) {
    console.log('⚠️  Certains checks critiques ont échoué. Corrigez les problèmes avant la mise en production.');
    process.exit(1);
  }

  console.log('🎉 Tous les tests de sécurité sont PASS! Le système est prêt pour la production.');
}

main().catch(error => {
  console.error('💥 Erreur fatale:', error.message);
  process.exit(1);
});