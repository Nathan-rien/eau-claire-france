#!/usr/bin/env tsx
/**
 * InfoEau ENV Diagnostic Script
 * Vérification complète des variables d'environnement Vite
 */

import * as fs from 'fs';
import * as path from 'path';

interface EnvDiagnostic {
  envFilePath: string;
  envFileExists: boolean;
  envFileContent: string;
  projectRoot: string;
  viteConfigPath: string;
  viteConfigExists: boolean;
  detectedVars: Record<string, string>;
  maskedVars: Record<string, string>;
  missingVars: string[];
  status: 'OK' | 'WARNING' | 'ERROR';
}

function maskValue(value: string): string {
  if (!value || value.length <= 8) return '***masked***';
  const start = value.substring(0, Math.ceil(value.length * 0.1));
  const end = value.substring(Math.floor(value.length * 0.9));
  const middle = '*'.repeat(value.length - start.length - end.length);
  return `${start}${middle}${end}`;
}

function findProjectRoot(): string {
  let currentDir = process.cwd();
  
  while (currentDir !== path.dirname(currentDir)) {
    const viteConfigPath = path.join(currentDir, 'vite.config.ts');
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(viteConfigPath) || fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}

function runEnvDiagnostic(): EnvDiagnostic {
  const projectRoot = findProjectRoot();
  const envFilePath = path.join(projectRoot, '.env');
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  
  console.log('🔍 InfoEau ENV Diagnostic');
  console.log('==========================');
  console.log(`📂 Projet détecté: ${projectRoot}`);
  console.log(`📄 Fichier .env: ${envFilePath}`);
  console.log(`⚙️  vite.config.ts: ${viteConfigPath}`);
  console.log('');
  
  const envFileExists = fs.existsSync(envFilePath);
  const viteConfigExists = fs.existsSync(viteConfigPath);
  
  let envFileContent = '';
  let detectedVars: Record<string, string> = {};
  
  if (envFileExists) {
    envFileContent = fs.readFileSync(envFilePath, 'utf-8');
    
    // Parse .env file
    const lines = envFileContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          detectedVars[key.trim()] = value;
        }
      }
    }
  }
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ADMIN_DASHBOARD_TOKEN'
  ];
  
  // Check for alternative keys
  if (!detectedVars['VITE_SUPABASE_ANON_KEY'] && detectedVars['VITE_SUPABASE_PUBLISHABLE_KEY']) {
    console.log('🔄 Mapping VITE_SUPABASE_PUBLISHABLE_KEY → VITE_SUPABASE_ANON_KEY');
    detectedVars['VITE_SUPABASE_ANON_KEY'] = detectedVars['VITE_SUPABASE_PUBLISHABLE_KEY'];
  }
  
  const maskedVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(detectedVars)) {
    maskedVars[key] = maskValue(value);
  }
  
  const missingVars = requiredVars.filter(varName => !detectedVars[varName]);
  
  let status: 'OK' | 'WARNING' | 'ERROR' = 'OK';
  if (!envFileExists || !viteConfigExists) {
    status = 'ERROR';
  } else if (missingVars.length > 0) {
    status = 'WARNING';
  }
  
  return {
    envFilePath,
    envFileExists,
    envFileContent,
    projectRoot,
    viteConfigPath,
    viteConfigExists,
    detectedVars,
    maskedVars,
    missingVars,
    status
  };
}

function generateReport(diagnostic: EnvDiagnostic): void {
  console.log('📊 RAPPORT ENV DÉTAILLÉ');
  console.log('========================');
  console.log('');
  
  console.log(`🎯 Statut Général: ${diagnostic.status}`);
  console.log(`📁 Racine du projet: ${diagnostic.projectRoot}`);
  console.log(`📄 Fichier .env: ${diagnostic.envFileExists ? '✅ Trouvé' : '❌ Manquant'} (${diagnostic.envFilePath})`);
  console.log(`⚙️  vite.config.ts: ${diagnostic.viteConfigExists ? '✅ Trouvé' : '❌ Manquant'} (${diagnostic.viteConfigPath})`);
  console.log('');
  
  console.log('🔑 Variables détectées:');
  console.log('========================');
  if (Object.keys(diagnostic.detectedVars).length === 0) {
    console.log('❌ Aucune variable détectée');
  } else {
    for (const [key, maskedValue] of Object.entries(diagnostic.maskedVars)) {
      const isRequired = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_ADMIN_DASHBOARD_TOKEN'].includes(key);
      const icon = isRequired ? '🔑' : '📝';
      console.log(`${icon} ${key}: ${maskedValue}`);
    }
  }
  console.log('');
  
  if (diagnostic.missingVars.length > 0) {
    console.log('⚠️ Variables manquantes:');
    console.log('========================');
    for (const varName of diagnostic.missingVars) {
      console.log(`❌ ${varName}`);
    }
    console.log('');
  }
  
  console.log('💡 RECOMMANDATIONS:');
  console.log('===================');
  
  if (!diagnostic.envFileExists) {
    console.log('🔧 Créer le fichier .env à la racine du projet');
    console.log('🔧 Copier les variables depuis .env.example si disponible');
  }
  
  if (!diagnostic.viteConfigExists) {
    console.log('🔧 Vérifier que vous êtes dans le bon répertoire de projet');
  }
  
  if (diagnostic.missingVars.length > 0) {
    console.log('🔧 Ajouter les variables manquantes au fichier .env');
  }
  
  if (diagnostic.status === 'OK') {
    console.log('✅ Configuration ENV correcte - Variables disponibles pour Vite');
  }
}

async function main() {
  try {
    const diagnostic = runEnvDiagnostic();
    generateReport(diagnostic);
    
    // Test import.meta.env simulation (ne fonctionne qu'au build/runtime)
    console.log('');
    console.log('ℹ️  Note: import.meta.env.* n\'est disponible qu\'au runtime Vite');
    console.log('   Les valeurs seront injectées lors du build/dev server');
    
    process.exit(diagnostic.status === 'ERROR' ? 1 : 0);
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { runEnvDiagnostic, generateReport };