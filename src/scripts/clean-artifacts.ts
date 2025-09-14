#!/usr/bin/env tsx
/**
 * Clean Debug and Export Artifacts Script
 * Removes debug files, exports, logs, and other temporary artifacts
 */

import fs from 'fs';
import path from 'path';

const ARTIFACTS_TO_CLEAN = [
  // Directories
  'debug',
  'exports',
  'tmp',
  'temp',
  '.tmp',
  
  // Files patterns
  '*.log',
  'SMOKE_RESULT.json',
  'coverage.json',
  'COVERAGE_REPORT.md',
  'HARDENING_SUMMARY.md',
  
  // Build artifacts
  '*.tsbuildinfo',
  'dist-ssr',
  
  // Source maps in production
  '**/*.js.map',
  '**/*.css.map',
  
  // Backup files
  '*.bak',
  '*.backup',
  '*.old',
  
  // IDE files
  '.vscode/settings.json',
  '*.swp',
  '*.swo',
  
  // OS files
  '.DS_Store',
  'Thumbs.db',
];

interface CleanupResult {
  removed: string[];
  errors: Array<{ path: string; error: string }>;
  totalSize: number;
}

class ArtifactCleaner {
  private result: CleanupResult = {
    removed: [],
    errors: [],
    totalSize: 0
  };

  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.promises.stat(filePath);
      return stats.isDirectory() ? await this.getDirectorySize(filePath) : stats.size;
    } catch {
      return 0;
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const files = await fs.promises.readdir(dirPath);
      let totalSize = 0;
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        totalSize += await this.getFileSize(fullPath);
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  private formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private async cleanPath(pattern: string): Promise<void> {
    const fullPath = path.resolve(process.cwd(), pattern);
    
    try {
      // Check if path exists
      const exists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      if (!exists) return;

      // Get size before removal
      const size = await this.getFileSize(fullPath);
      
      // Remove the path
      await fs.promises.rm(fullPath, { recursive: true, force: true });
      
      this.result.removed.push(pattern);
      this.result.totalSize += size;
      
      console.log(`✅ Removed: ${pattern} (${this.formatSize(size)})`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.result.errors.push({ path: pattern, error: errorMsg });
      console.log(`❌ Failed to remove: ${pattern} - ${errorMsg}`);
    }
  }

  private async cleanGlobPattern(pattern: string): Promise<void> {
    const { glob } = await import('glob');
    
    try {
      const matches = await glob(pattern, { 
        cwd: process.cwd(),
        dot: true,
        ignore: ['node_modules/**', '.git/**']
      });
      
      for (const match of matches) {
        await this.cleanPath(match);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.result.errors.push({ path: pattern, error: errorMsg });
      console.log(`❌ Failed to process glob pattern: ${pattern} - ${errorMsg}`);
    }
  }

  async cleanAll(dryRun = false): Promise<CleanupResult> {
    console.log(`🧹 ${dryRun ? 'DRY RUN: ' : ''}Cleaning debug and export artifacts...\n`);

    if (dryRun) {
      console.log('ℹ️  This is a dry run - no files will actually be removed\n');
    }

    for (const artifact of ARTIFACTS_TO_CLEAN) {
      if (artifact.includes('*')) {
        // Handle glob patterns
        if (!dryRun) {
          await this.cleanGlobPattern(artifact);
        } else {
          console.log(`Would clean glob: ${artifact}`);
        }
      } else {
        // Handle direct paths
        if (!dryRun) {
          await this.cleanPath(artifact);
        } else {
          const fullPath = path.resolve(process.cwd(), artifact);
          const exists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
          if (exists) {
            const size = await this.getFileSize(fullPath);
            console.log(`Would remove: ${artifact} (${this.formatSize(size)})`);
          }
        }
      }
    }

    return this.result;
  }

  generateReport(): void {
    console.log('\n📊 Cleanup Summary:');
    console.log(`  ✅ Items removed: ${this.result.removed.length}`);
    console.log(`  ❌ Errors: ${this.result.errors.length}`);
    console.log(`  💾 Total space freed: ${this.formatSize(this.result.totalSize)}`);

    if (this.result.removed.length > 0) {
      console.log('\n📋 Removed items:');
      this.result.removed.forEach(item => {
        console.log(`  • ${item}`);
      });
    }

    if (this.result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.result.errors.forEach(({ path, error }) => {
        console.log(`  • ${path}: ${error}`);
      });
    }

    console.log('\n🎉 Cleanup completed!');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const force = args.includes('--force') || args.includes('-f');

  if (!dryRun && !force) {
    console.log('⚠️  This will permanently delete debug artifacts and logs.');
    console.log('Run with --dry-run to see what would be deleted, or --force to proceed.');
    process.exit(1);
  }

  const cleaner = new ArtifactCleaner();
  await cleaner.cleanAll(dryRun);
  cleaner.generateReport();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
}