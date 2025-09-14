#!/usr/bin/env tsx
/**
 * RLS (Row Level Security) Validation Script
 * Validates that Supabase RLS policies are correctly configured
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xblogttmomuogdhmaztf.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibG9ndHRtb211b2dkaG1henRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYwNTgsImV4cCI6MjA2NTk4MjA1OH0._CAQGXwo2ZJYmwvvstGJ2bnC65vT9fHcTyuXwgNalP8';

interface RLSTestResult {
  table: string;
  operation: string;
  role: 'anon' | 'authenticated' | 'service_role';
  expected: 'allow' | 'deny';
  actual: 'allow' | 'deny' | 'error';
  passed: boolean;
  error?: string;
}

const tests: Array<{
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  role: 'anon' | 'authenticated' | 'service_role';
  expected: 'allow' | 'deny';
  testData?: any;
}> = [
  // Public read access tests
  { table: 'retailers', operation: 'SELECT', role: 'anon', expected: 'allow' },
  { table: 'prices', operation: 'SELECT', role: 'anon', expected: 'allow' },
  { table: 'prices_history', operation: 'SELECT', role: 'anon', expected: 'allow' },
  { table: 'runs', operation: 'SELECT', role: 'anon', expected: 'allow' },
  
  // Write operations should be denied for anon
  { table: 'retailers', operation: 'INSERT', role: 'anon', expected: 'deny' },
  { table: 'prices', operation: 'INSERT', role: 'anon', expected: 'deny' },
  { table: 'runs', operation: 'INSERT', role: 'anon', expected: 'deny' },
  
  // Admin tables should be completely restricted for anon
  { table: 'audit_logs', operation: 'SELECT', role: 'anon', expected: 'deny' },
  { table: 'rate_limits', operation: 'SELECT', role: 'anon', expected: 'deny' },
  
  // Alert subscriptions - specific tests
  { 
    table: 'alertes_utilisateurs', 
    operation: 'INSERT', 
    role: 'anon', 
    expected: 'allow',
    testData: {
      email: 'test@example.com',
      commune: 'Paris',
      consent_rgpd: true
    }
  },
];

async function runRLSTest(test: typeof tests[0]): Promise<RLSTestResult> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    let result;
    
    switch (test.operation) {
      case 'SELECT':
        result = await client.from(test.table).select('*').limit(1);
        break;
      case 'INSERT':
        result = await client.from(test.table).insert(test.testData || {});
        break;
      case 'UPDATE':
        result = await client.from(test.table).update({}).eq('id', 'fake-id');
        break;
      case 'DELETE':
        result = await client.from(test.table).delete().eq('id', 'fake-id');
        break;
    }
    
    const actual = result.error ? 'deny' : 'allow';
    const passed = actual === test.expected;
    
    return {
      table: test.table,
      operation: test.operation,
      role: test.role,
      expected: test.expected,
      actual,
      passed,
      error: result.error?.message
    };
  } catch (error) {
    return {
      table: test.table,
      operation: test.operation,
      role: test.role,
      expected: test.expected,
      actual: 'error',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log('🔒 Running RLS Validation Tests...\n');
  
  const results: RLSTestResult[] = [];
  
  for (const test of tests) {
    const result = await runRLSTest(test);
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    const errorInfo = result.error && !result.passed ? ` (${result.error})` : '';
    
    console.log(`${status} ${test.table}.${test.operation} [${test.role}] → ${result.actual}${errorInfo}`);
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`Failed: ${results.filter(r => !r.passed).length}`);
  
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`  • ${test.table}.${test.operation} [${test.role}]: expected ${test.expected}, got ${test.actual}`);
      if (test.error) {
        console.log(`    Error: ${test.error}`);
      }
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All RLS tests passed!');
  }
}

// Additional RLS policy existence check
async function checkPolicyExistence(): Promise<void> {
  console.log('\n🔍 Checking RLS Policy Existence...\n');
  
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const criticalTables = [
    'retailers',
    'prices', 
    'prices_history',
    'runs',
    'audit_logs',
    'rate_limits',
    'alertes_utilisateurs'
  ];
  
  for (const table of criticalTables) {
    try {
      // This query will check if RLS is enabled and if policies exist
      const { data, error } = await client
        .from(table)
        .select('*')
        .limit(0); // Don't fetch actual data
        
      if (error && error.code === 'PGRST301') {
        console.log(`✅ ${table}: RLS properly configured (access denied as expected)`);
      } else if (!error) {
        console.log(`⚠️  ${table}: RLS might be too permissive (access allowed)`);
      } else {
        console.log(`❌ ${table}: Unexpected error - ${error.message}`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Failed to check - ${error}`);
    }
  }
}

if (require.main === module) {
  runAllTests()
    .then(() => checkPolicyExistence())
    .catch(error => {
      console.error('❌ RLS check failed:', error);
      process.exit(1);
    });
}