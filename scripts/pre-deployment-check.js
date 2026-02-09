#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Runs all deployment readiness checks before allowing deployment
 *
 * Usage: node scripts/pre-deployment-check.js [--environment=production]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const environment = args.find((a) => a.startsWith('--environment='))?.split('=')[1] || 'production';

console.log('\n🚀 PRE-DEPLOYMENT VERIFICATION\n');
console.log(`Environment: ${environment}`);
console.log('='.repeat(60));

const checks = [];
let hasErrors = false;
let hasWarnings = false;

/**
 * Add a check result
 */
function addCheck(name, status, message) {
  const statusIcon = {
    ok: '✅',
    warning: '⚠️',
    error: '🔴',
  }[status];

  checks.push({ name, status, message });
  console.log(`${statusIcon} ${name}: ${message}`);

  if (status === 'error') hasErrors = true;
  if (status === 'warning') hasWarnings = true;
}

/**
 * Check 1: Node.js version
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

  if (majorVersion < 18) {
    addCheck('Node.js Version', 'warning', `${nodeVersion} (recommended 18+)`);
  } else {
    addCheck('Node.js Version', 'ok', nodeVersion);
  }
}

/**
 * Check 2: Environment file exists
 */
function checkEnvironmentFile() {
  const envFile = path.join(process.cwd(), `.env.${environment}`);
  if (!fs.existsSync(envFile)) {
    addCheck(
      'Environment File',
      'error',
      `${envFile} not found`
    );
    return false;
  }
  addCheck('Environment File', 'ok', `${envFile} exists`);
  return true;
}

/**
 * Check 3: Required environment variables
 */
function checkRequiredEnvVars() {
  const envFile = path.join(process.cwd(), `.env.${environment}`);
  const content = fs.readFileSync(envFile, 'utf-8');

  const requiredVars = {
    production: [
      'NODE_ENV',
      'API_URL',
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ],
    staging: [
      'NODE_ENV',
      'API_URL',
      'DATABASE_URL',
      'JWT_SECRET',
      'STRIPE_SECRET_KEY',
    ],
    development: ['NODE_ENV', 'DATABASE_URL'],
  };

  const vars = requiredVars[environment] || [];
  const missing = [];

  for (const varName of vars) {
    if (!content.includes(`${varName}=`) || content.includes(`${varName}=REPLACE_`)) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    addCheck(
      'Environment Variables',
      'error',
      `Missing or incomplete: ${missing.join(', ')}`
    );
  } else {
    addCheck('Environment Variables', 'ok', `All ${vars.length} required variables set`);
  }
}

/**
 * Check 4: Build output exists
 */
function checkBuildOutput() {
  const apiDist = path.join(process.cwd(), 'services/api/dist');
  const storefrontDist = path.join(process.cwd(), 'apps/storefront/.next');

  const apiBuilt = fs.existsSync(apiDist);
  const storefrontBuilt = fs.existsSync(storefrontDist);

  if (!apiBuilt && !storefrontBuilt) {
    addCheck('Build Output', 'error', 'No builds found. Run build scripts first.');
    return false;
  }

  if (!apiBuilt) {
    addCheck('Build Output', 'warning', 'API not built. Run: cd services/api && npm run build');
  } else if (!storefrontBuilt) {
    addCheck('Build Output', 'warning', 'Storefront not built. Run: cd apps/storefront && npm run build');
  } else {
    addCheck('Build Output', 'ok', 'Both API and Storefront built');
  }

  return true;
}

/**
 * Check 5: Package.json versions match
 */
function checkPackageVersions() {
  try {
    const rootPkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    const apiPkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'services/api/package.json'), 'utf-8')
    );
    const storefrontPkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'apps/storefront/package.json'), 'utf-8')
    );

    addCheck(
      'Package Versions',
      'ok',
      `Root: ${rootPkg.version}, API: ${apiPkg.version}, Storefront: ${storefrontPkg.version}`
    );
  } catch (error) {
    addCheck('Package Versions', 'warning', 'Unable to verify versions');
  }
}

/**
 * Check 6: Git status
 */
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (status && environment === 'production') {
      addCheck(
        'Git Status',
        'warning',
        'Uncommitted changes detected. Ensure all changes are committed.'
      );
    } else {
      addCheck('Git Status', 'ok', 'Working directory clean');
    }
  } catch {
    addCheck('Git Status', 'warning', 'Not a git repository');
  }
}

/**
 * Check 7: Docker files (if applicable)
 */
function checkDockerFiles() {
  const dockerfile = path.join(process.cwd(), 'Dockerfile');
  const dockerCompose = path.join(process.cwd(), 'docker-compose.yml');

  if (fs.existsSync(dockerfile) && fs.existsSync(dockerCompose)) {
    addCheck('Docker Files', 'ok', 'Both Dockerfile and docker-compose.yml present');
  } else if (fs.existsSync(dockerfile) || fs.existsSync(dockerCompose)) {
    addCheck('Docker Files', 'warning', 'Only partial Docker setup found');
  } else {
    addCheck('Docker Files', 'warning', 'No Docker configuration found');
  }
}

/**
 * Check 8: Database connection
 */
function checkDatabaseConnection() {
  try {
    // Try to read .env file to get DATABASE_URL
    const envFile = path.join(process.cwd(), `.env.${environment}`);
    const content = fs.readFileSync(envFile, 'utf-8');
    const dbUrlMatch = content.match(/DATABASE_URL="?([^"\n]+)"?/);

    if (dbUrlMatch && dbUrlMatch[1]) {
      const dbUrl = dbUrlMatch[1];
      addCheck('Database Connection', 'warning', 'Environment configured. Verify actual connection during deployment.');
    } else {
      addCheck('Database Connection', 'error', 'DATABASE_URL not found in environment file');
    }
  } catch (error) {
    addCheck('Database Connection', 'warning', 'Unable to verify database configuration');
  }
}

/**
 * Check 9: Secrets validation
 */
function checkSecrets() {
  try {
    const envFile = path.join(process.cwd(), `.env.${environment}`);
    const content = fs.readFileSync(envFile, 'utf-8');

    const hasReplace = content.includes('REPLACE_WITH_');
    const jwtMatch = content.match(/JWT_SECRET="?([^"\n]+)"?/);
    const jwtLength = jwtMatch ? jwtMatch[1]?.length : 0;

    if (hasReplace) {
      addCheck('Secrets', 'error', 'Environment file contains REPLACE_WITH_ placeholders');
    } else if (environment !== 'development' && jwtLength < 32) {
      addCheck('Secrets', 'warning', `JWT_SECRET may be too short (${jwtLength} chars, min 32)`);
    } else {
      addCheck('Secrets', 'ok', 'Secrets configured (verify sensitive values not in git)');
    }
  } catch (error) {
    addCheck('Secrets', 'warning', 'Unable to verify secrets');
  }
}

/**
 * Check 10: Port configuration
 */
function checkPortConfiguration() {
  try {
    const envFile = path.join(process.cwd(), `.env.${environment}`);
    const content = fs.readFileSync(envFile, 'utf-8');
    const portMatch = content.match(/API_PORT="?([^"\n]+)"?/);
    const port = portMatch ? portMatch[1] : '3333';

    if (port < 1024 && process.platform !== 'win32') {
      addCheck('Port Configuration', 'warning', `Port ${port} requires elevated privileges on Unix`);
    } else {
      addCheck('Port Configuration', 'ok', `API Port: ${port}`);
    }
  } catch {
    addCheck('Port Configuration', 'warning', 'Unable to verify port configuration');
  }
}

/**
 * Run all checks
 */
function runAllChecks() {
  console.log('\n📋 RUNNING CHECKS\n');
  checkNodeVersion();
  checkEnvironmentFile() && (
    checkRequiredEnvVars(),
    checkSecrets(),
    checkPortConfiguration()
  );
  checkBuildOutput();
  checkPackageVersions();
  checkGitStatus();
  checkDockerFiles();
  checkDatabaseConnection();
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');

  const okCount = checks.filter((c) => c.status === 'ok').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const errorCount = checks.filter((c) => c.status === 'error').length;

  console.log(`✅ Passed: ${okCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`🔴 Errors: ${errorCount}`);

  console.log('\n' + '='.repeat(60));

  if (hasErrors) {
    console.log('\n❌ DEPLOYMENT BLOCKED: Critical errors detected\n');
    console.log('Actions required before deployment:');
    checks
      .filter((c) => c.status === 'error')
      .forEach((c) => {
        console.log(`  - ${c.name}: ${c.message}`);
      });
    return false;
  }

  if (hasWarnings) {
    console.log('\n⚠️  DEPLOYMENT ALLOWED WITH CAUTION: Warnings detected\n');
    console.log('Please review the following before proceeding:');
    checks
      .filter((c) => c.status === 'warning')
      .forEach((c) => {
        console.log(`  - ${c.name}: ${c.message}`);
      });
  } else {
    console.log('\n✅ ALL CHECKS PASSED: Ready for deployment!\n');
  }

  return true;
}

// Run checks
runAllChecks();
const success = printSummary();

process.exit(hasErrors ? 1 : 0);
