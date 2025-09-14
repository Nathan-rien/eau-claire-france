#!/usr/bin/env tsx
/**
 * Security Hardening Validation Script
 * Validates security configuration and hardening measures
 */

import fs from 'fs';
import path from 'path';
import { FLAGS, IS_PROD, getEnvironmentInfo } from '../config/flags';
import { validateSecurityHeaders, SECURITY_HEADERS } from '../utils/securityHeaders';

interface HardeningResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical?: boolean;
}

class HardeningValidator {
  private results: HardeningResult[] = [];

  private addResult(
    category: string, 
    check: string, 
    status: 'pass' | 'fail' | 'warning', 
    message: string,
    critical = false
  ) {
    this.results.push({ category, check, status, message, critical });
  }

  async validateFeatureFlags(): Promise<void> {
    const category = 'Feature Flags';
    
    // Check production flags
    if (IS_PROD) {
      this.addResult(
        category,
        'Admin UI in Production',
        FLAGS.FF_ADMIN_UI ? 'warning' : 'pass',
        FLAGS.FF_ADMIN_UI 
          ? 'Admin UI is enabled in production - consider disabling'
          : 'Admin UI properly disabled in production',
        true
      );

      this.addResult(
        category,
        'Debug Routes in Production',
        FLAGS.FF_DEBUG_ROUTES ? 'fail' : 'pass',
        FLAGS.FF_DEBUG_ROUTES 
          ? 'Debug routes are enabled in production - SECURITY RISK'
          : 'Debug routes properly disabled in production',
        true
      );

      this.addResult(
        category,
        'QuickStart in Production',
        FLAGS.FF_QUICKSTART ? 'warning' : 'pass',
        FLAGS.FF_QUICKSTART 
          ? 'QuickStart component enabled in production'
          : 'QuickStart properly disabled in production'
      );
    }

    // Check if source maps are disabled in production
    this.addResult(
      category,
      'Source Maps',
      (IS_PROD && FLAGS.FF_SOURCE_MAPS) ? 'fail' : 'pass',
      (IS_PROD && FLAGS.FF_SOURCE_MAPS) 
        ? 'Source maps are enabled in production - SECURITY RISK'
        : 'Source maps configuration is appropriate',
      true
    );
  }

  async validateRobotsTxt(): Promise<void> {
    const category = 'SEO Security';
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    
    try {
      const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
      
      const requiredDisallows = ['/admin/', '/api/', '/debug/', '/exports/'];
      const missingDisallows = requiredDisallows.filter(
        disallow => !robotsContent.includes(`Disallow: ${disallow}`)
      );

      this.addResult(
        category,
        'Robots.txt Admin Protection',
        missingDisallows.length === 0 ? 'pass' : 'fail',
        missingDisallows.length === 0 
          ? 'All sensitive paths properly disallowed in robots.txt'
          : `Missing disallows: ${missingDisallows.join(', ')}`,
        true
      );
    } catch (error) {
      this.addResult(
        category,
        'Robots.txt Existence',
        'fail',
        'robots.txt file not found',
        true
      );
    }
  }

  async validateGitignore(): Promise<void> {
    const category = 'Source Control Security';
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    
    try {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      
      const requiredEntries = [
        'debug/**',
        'exports/**',
        '*.log',
        'SMOKE_RESULT.json',
        'coverage.json',
        'COVERAGE_REPORT.md'
      ];

      const missingEntries = requiredEntries.filter(
        entry => !gitignoreContent.includes(entry)
      );

      this.addResult(
        category,
        'Gitignore Artifact Protection',
        missingEntries.length === 0 ? 'pass' : 'warning',
        missingEntries.length === 0 
          ? 'All debug/export artifacts properly ignored'
          : `Consider adding: ${missingEntries.join(', ')}`
      );
    } catch (error) {
      this.addResult(
        category,
        'Gitignore Existence',
        'warning',
        '.gitignore file not found or unreadable'
      );
    }
  }

  async validateEnvironmentVariables(): Promise<void> {
    const category = 'Environment Security';
    
    // Check for sensitive variables in client bundle
    const clientVars = Object.keys(import.meta.env || {});
    const sensitivePatterns = [
      /service.*role/i,
      /secret/i,
      /private/i,
      /admin.*token/i
    ];

    const exposedSensitive = clientVars.filter(varName =>
      sensitivePatterns.some(pattern => pattern.test(varName))
    );

    this.addResult(
      category,
      'Client-side Variable Exposure',
      exposedSensitive.length === 0 ? 'pass' : 'fail',
      exposedSensitive.length === 0 
        ? 'No sensitive variables exposed to client'
        : `Potentially sensitive variables in client: ${exposedSensitive.join(', ')}`,
      true
    );

    // Check required variables
    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

    this.addResult(
      category,
      'Required Variables',
      missingVars.length === 0 ? 'pass' : 'fail',
      missingVars.length === 0 
        ? 'All required environment variables present'
        : `Missing variables: ${missingVars.join(', ')}`,
      true
    );
  }

  async validateSecurityHeaders(): Promise<void> {
    const category = 'HTTP Security';
    
    const validation = validateSecurityHeaders(SECURITY_HEADERS);
    
    this.addResult(
      category,
      'Security Headers Configuration',
      validation.valid ? 'pass' : 'fail',
      validation.valid 
        ? 'All required security headers configured'
        : `Missing headers: ${validation.missing.join(', ')}`,
      true
    );

    if (validation.warnings.length > 0) {
      this.addResult(
        category,
        'Security Headers Warnings',
        'warning',
        `Security concerns: ${validation.warnings.join(', ')}`
      );
    }
  }

  async validateBuildArtifacts(): Promise<void> {
    const category = 'Build Security';
    
    // Check for debug directories
    const debugPaths = ['debug', 'exports', 'tmp'];
    const existingDebugPaths = debugPaths.filter(dirPath => {
      try {
        return fs.existsSync(path.join(process.cwd(), dirPath));
      } catch {
        return false;
      }
    });

    this.addResult(
      category,
      'Debug Artifacts Cleanup',
      existingDebugPaths.length === 0 ? 'pass' : 'warning',
      existingDebugPaths.length === 0 
        ? 'No debug artifacts found'
        : `Debug directories exist: ${existingDebugPaths.join(', ')}`
    );

    // Check for log files in root
    try {
      const rootFiles = fs.readdirSync(process.cwd());
      const logFiles = rootFiles.filter(file => 
        file.endsWith('.log') || 
        file === 'SMOKE_RESULT.json' || 
        file === 'coverage.json'
      );

      this.addResult(
        category,
        'Root Directory Cleanup',
        logFiles.length === 0 ? 'pass' : 'warning',
        logFiles.length === 0 
          ? 'No log files in root directory'
          : `Log files in root: ${logFiles.join(', ')}`
      );
    } catch (error) {
      this.addResult(
        category,
        'Root Directory Check',
        'warning',
        'Could not check root directory for artifacts'
      );
    }
  }

  async runAllValidations(): Promise<void> {
    console.log('🛡️  Running Security Hardening Validation...\n');

    await this.validateFeatureFlags();
    await this.validateRobotsTxt();
    await this.validateGitignore();
    await this.validateEnvironmentVariables();
    await this.validateSecurityHeaders();
    await this.validateBuildArtifacts();
  }

  generateReport(): void {
    console.log('📊 Hardening Validation Results:\n');

    const categories = [...new Set(this.results.map(r => r.category))];
    
    categories.forEach(category => {
      console.log(`\n📂 ${category}:`);
      const categoryResults = this.results.filter(r => r.category === category);
      
      categoryResults.forEach(result => {
        const icon = {
          pass: '✅',
          fail: '❌',
          warning: '⚠️'
        }[result.status];
        
        const criticalFlag = result.critical ? ' [CRITICAL]' : '';
        console.log(`  ${icon} ${result.check}${criticalFlag}`);
        console.log(`     ${result.message}`);
      });
    });

    // Summary
    const totals = {
      pass: this.results.filter(r => r.status === 'pass').length,
      fail: this.results.filter(r => r.status === 'fail').length,
      warning: this.results.filter(r => r.status === 'warning').length,
      critical: this.results.filter(r => r.critical && r.status === 'fail').length
    };

    console.log('\n📋 Summary:');
    console.log(`  ✅ Passed: ${totals.pass}`);
    console.log(`  ⚠️  Warnings: ${totals.warning}`);
    console.log(`  ❌ Failed: ${totals.fail}`);
    console.log(`  🚨 Critical Failures: ${totals.critical}`);

    // Environment info
    console.log('\n🌍 Environment Info:');
    const envInfo = getEnvironmentInfo();
    console.log(`  Environment: ${envInfo.environment}`);
    console.log(`  Security Level: ${envInfo.securityLevel}`);
    console.log(`  Active Flags: ${envInfo.activeFlags.join(', ') || 'none'}`);

    if (totals.critical > 0) {
      console.log('\n🚨 CRITICAL SECURITY ISSUES DETECTED!');
      console.log('Please address critical failures before deploying to production.');
      process.exit(1);
    } else if (totals.fail > 0) {
      console.log('\n⚠️  Some security checks failed. Review and fix if needed.');
      process.exit(1);
    } else {
      console.log('\n🎉 All security hardening checks passed!');
    }
  }
}

async function main() {
  const validator = new HardeningValidator();
  await validator.runAllValidations();
  validator.generateReport();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Hardening validation failed:', error);
    process.exit(1);
  });
}