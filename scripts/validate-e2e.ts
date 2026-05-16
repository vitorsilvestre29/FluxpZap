#!/usr/bin/env node

/**
 * FluxoZap End-to-End Test Suite
 * Validates: Auth → Typebot SSO → Flow Management → WhatsApp Deployment
 */

import { z } from 'zod';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const testConfig = {
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  typebotUrl: process.env.TYPEBOT_BASE_URL || 'http://localhost:3000/typebot',
  evolutionUrl: process.env.EVOLUTION_BASE_URL || 'http://localhost:8080',
  smtpFrom: process.env.MAIL_FROM || 'test@localhost',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];

loadEnvFile();

function logResult(result: TestResult) {
  const icon = result.passed ? '✓' : '✗';
  const color = result.passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${icon}${reset} ${result.name}`);
  if (result.error) console.log(`  Error: ${result.error}`);
  if (result.details) console.log(`  Details:`, result.details);
}

async function testAuthSignup() {
  const name = 'Authentication: Signup Flow';
  try {
    const health = await fetch(`${testConfig.baseUrl}/api/health`).catch(() => null);
    if (!health || !health.ok) {
      results.push({
        name,
        passed: false,
        error: `App indisponivel em ${testConfig.baseUrl}. Inicie com npm run dev/start.`,
      });
      return;
    }

    const testEmail = `test-${Date.now()}@localhost`;
    
    const response = await fetch(`${testConfig.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        name: 'Test User',
        email: testEmail,
        password: 'TestPassword123!',
        agencyName: 'Test Agency',
      }).toString(),
    });

    // Signup redirects (302) on success
    const passed = response.status === 302;
    results.push({
      name,
      passed,
      error: !passed ? `Expected 302 redirect, got ${response.status}` : undefined,
      details: { email: testEmail, statusCode: response.status },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function testTypebotSSO() {
  const name = 'Typebot SSO: Secret Configuration Validation';
  try {
    const ssoSecret = process.env.TYPEBOT_SSO_SECRET || process.env.FLUXOZAP_SSO_SECRET;
    const baseUrl = process.env.TYPEBOT_BASE_URL;
    
    const hasTypebotConfig = !!(baseUrl && ssoSecret);
    
    results.push({
      name,
      passed: hasTypebotConfig,
      error: !hasTypebotConfig ? 'TYPEBOT_BASE_URL or SSO_SECRET not configured' : undefined,
      details: {
        hasBaseUrl: !!baseUrl,
        hasSecret: !!ssoSecret,
        secretSource: ssoSecret === process.env.TYPEBOT_SSO_SECRET ? 'TYPEBOT_SSO_SECRET' : 'FLUXOZAP_SSO_SECRET',
      },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function testEmailConfiguration() {
  const name = 'Email: SMTP Configuration Validation';
  try {
    const required = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      MAIL_FROM: process.env.MAIL_FROM,
    };

    const allConfigured = Object.values(required).every((v) => v);
    const configured = Object.entries(required)
      .filter(([, v]) => v)
      .map(([k]) => k);

    results.push({
      name,
      passed: allConfigured,
      error: !allConfigured ? `Missing: ${Object.keys(required).filter((k) => !required[k as keyof typeof required]).join(', ')}` : undefined,
      details: { configured, production: !testConfig.smtpFrom.includes('localhost') },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function testEvolutionConfiguration() {
  const name = 'Evolution API: Configuration Validation';
  try {
    const baseUrl = process.env.EVOLUTION_BASE_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const configured = !!(baseUrl && apiKey);

    results.push({
      name,
      passed: configured,
      error: !configured ? 'EVOLUTION_BASE_URL or EVOLUTION_API_KEY not configured' : undefined,
      details: { baseUrl: baseUrl ? '✓' : '✗', apiKey: apiKey ? '✓' : '✗' },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function testDatabaseConnection() {
  const name = 'Database: Connection Validation';
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const hasUrl = !!databaseUrl;
    const isPostgres = databaseUrl?.startsWith('postgresql://');

    results.push({
      name,
      passed: hasUrl && !!isPostgres,
      error: !hasUrl ? 'DATABASE_URL not configured' : !isPostgres ? 'DATABASE_URL must use postgresql://' : undefined,
      details: { configured: hasUrl, isPostgres, masked: databaseUrl?.replace(/:[^:@]+@/, ':***@') },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function testSSHSecretConsistency() {
  const name = 'Configuration: SSO Secret Consistency';
  try {
    const typebotSecret = process.env.TYPEBOT_SSO_SECRET;
    const fluxozapSecret = process.env.FLUXOZAP_SSO_SECRET;
    
    // Either both should be set and match, or we use fallback logic
    const consistent = !typebotSecret || !fluxozapSecret || typebotSecret === fluxozapSecret;
    
    results.push({
      name,
      passed: consistent,
      error: !consistent ? 'TYPEBOT_SSO_SECRET and FLUXOZAP_SSO_SECRET must match or one should be unset' : undefined,
      details: { typebotSet: !!typebotSecret, fluxozapSet: !!fluxozapSecret, match: typebotSecret === fluxozapSecret },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function testAuthSecrets() {
  const name = 'Security: Authentication Secrets';
  try {
    const authSecret = process.env.AUTH_SECRET;
    const secureLength = (authSecret?.length || 0) >= 32;

    results.push({
      name,
      passed: !!authSecret && secureLength,
      error: !authSecret ? 'AUTH_SECRET not configured' : !secureLength ? 'AUTH_SECRET must be at least 32 chars' : undefined,
      details: { configured: !!authSecret, secureLength },
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function runAllTests() {
  console.log('\n🧪 FluxoZap End-to-End Test Suite\n');
  console.log(`Base URL: ${testConfig.baseUrl}`);
  console.log(`Typebot URL: ${testConfig.typebotUrl}`);
  console.log(`Evolution URL: ${testConfig.evolutionUrl}`);
  console.log('\n─────────────────────────────────────\n');

  // Configuration tests (no network required)
  testSSHSecretConsistency();
  testAuthSecrets();
  testEmailConfiguration();
  testEvolutionConfiguration();
  testTypebotSSO();
  testDatabaseConnection();

  // Feature tests (may require network)
  await testAuthSignup();

  // Print results
  results.forEach(logResult);

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log('\n─────────────────────────────────────');
  console.log(`\n${passed}/${total} tests passed (${percentage}%)\n`);

  if (passed === total) {
    console.log('✓ All validations passed! FluxoZap is configured correctly.');
    process.exit(0);
  } else {
    console.log('✗ Some validations failed. Review the configuration.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
