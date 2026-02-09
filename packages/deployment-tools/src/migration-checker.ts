/**
 * Database Migration Safety Utility
 * Ensures migrations are safe for production deployment
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MigrationFile {
  name: string;
  timestamp: string;
  path: string;
  content: string;
  isDangerous: boolean;
  dangerousOperations: string[];
}

export interface MigrationCheck {
  totalMigrations: number;
  appliedMigrations: number;
  pendingMigrations: number;
  dangerousMigrations: MigrationFile[];
  warnings: string[];
  safe: boolean;
}

/**
 * Dangerous SQL patterns that should be warned about
 */
const DANGEROUS_PATTERNS = [
  { pattern: /DROP\s+TABLE/i, description: 'Dropping table' },
  { pattern: /DROP\s+COLUMN/i, description: 'Dropping column' },
  { pattern: /DELETE\s+FROM/i, description: 'Deleting data' },
  { pattern: /TRUNCATE\s+TABLE/i, description: 'Truncating table' },
  { pattern: /ALTER\s+TABLE.*RENAME/i, description: 'Renaming table' },
  { pattern: /UPDATE\s+.*SET/i, description: 'Updating data without WHERE clause' },
];

/**
 * Check migration files for dangerous operations
 */
export function checkMigrations(
  migrationsDir: string,
  appliedMigrations: string[] = []
): MigrationCheck {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const check: MigrationCheck = {
    totalMigrations: 0,
    appliedMigrations: appliedMigrations.length,
    pendingMigrations: 0,
    dangerousMigrations: [],
    warnings: [],
    safe: true,
  };

  const files = fs.readdirSync(migrationsDir);
  const sqlFiles = files
    .filter((f) => f.endsWith('.sql'))
    .sort();

  check.totalMigrations = sqlFiles.length;
  check.pendingMigrations = sqlFiles.length - appliedMigrations.length;

  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const timestamp = file.split('_')[0];

    const migration: MigrationFile = {
      name: file,
      timestamp,
      path: filePath,
      content,
      isDangerous: false,
      dangerousOperations: [],
    };

    // Check for dangerous patterns
    for (const { pattern, description } of DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        migration.isDangerous = true;
        migration.dangerousOperations.push(description);
      }
    }

    if (migration.isDangerous) {
      check.dangerousMigrations.push(migration);
    }
  }

  // Generate warnings
  if (check.dangerousMigrations.length > 0) {
    check.safe = false;
    check.warnings.push(
      `⚠️  Found ${check.dangerousMigrations.length} potentially dangerous migration(s). Review before deployment.`
    );
  }

  if (check.pendingMigrations > 0) {
    check.warnings.push(
      `⏳ ${check.pendingMigrations} pending migration(s) will be applied on deployment`
    );
  }

  if (check.pendingMigrations === 0) {
    check.warnings.push(
      `✅ All ${check.totalMigrations} migration(s) are already applied`
    );
  }

  return check;
}

/**
 * Validate migration naming convention
 */
export function validateMigrationNaming(migrationsDir: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!fs.existsSync(migrationsDir)) {
    return { valid: false, errors: [`Directory not found: ${migrationsDir}`] };
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

  for (const file of files) {
    // Expected format: YYYYMMDDHHMMSS_description.sql
    const pattern = /^\d{14}_[a-z0-9_]+\.sql$/i;
    if (!pattern.test(file)) {
      errors.push(
        `Invalid naming: ${file}. Expected format: YYYYMMDDHHMMSS_description.sql`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for migration conflicts
 */
export function checkMigrationConflicts(migrationsDir: string): {
  hasConflicts: boolean;
  conflicts: Array<{ files: string[]; timestamp: string }>;
} {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  const timestampMap = new Map<string, string[]>();

  for (const file of files) {
    const timestamp = file.split('_')[0];
    if (!timestampMap.has(timestamp)) {
      timestampMap.set(timestamp, []);
    }
    timestampMap.get(timestamp)!.push(file);
  }

  const conflicts = Array.from(timestampMap.entries())
    .filter(([, files]) => files.length > 1)
    .map(([timestamp, files]) => ({ timestamp, files }));

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Format migration check results
 */
export function formatMigrationCheck(check: MigrationCheck): string {
  let output = '\n🗄️  DATABASE MIGRATION CHECK\n';
  output += '='.repeat(50) + '\n\n';

  output += `Total Migrations: ${check.totalMigrations}\n`;
  output += `Applied: ${check.appliedMigrations}\n`;
  output += `Pending: ${check.pendingMigrations}\n\n`;

  if (check.dangerousMigrations.length > 0) {
    output += `⚠️  POTENTIALLY DANGEROUS MIGRATIONS:\n`;
    check.dangerousMigrations.forEach((mig) => {
      output += `   ${mig.name}\n`;
      mig.dangerousOperations.forEach((op) => {
        output += `      - ${op}\n`;
      });
    });
    output += '\n';
  }

  if (check.warnings.length > 0) {
    output += `📋 WARNINGS:\n`;
    check.warnings.forEach((warning) => {
      output += `   ${warning}\n`;
    });
    output += '\n';
  }

  output += `Status: ${check.safe ? '✅ SAFE' : '⚠️  REVIEW REQUIRED'}\n`;
  output += '='.repeat(50) + '\n';

  return output;
}

/**
 * Generate pre-deployment migration summary
 */
export function generateMigrationSummary(
  migrationsDir: string,
  appliedMigrations: string[] = []
): {
  safe: boolean;
  message: string;
  actions: string[];
} {
  const check = checkMigrations(migrationsDir, appliedMigrations);
  const naming = validateMigrationNaming(migrationsDir);
  const conflicts = checkMigrationConflicts(migrationsDir);

  const actions: string[] = [];
  let safe = true;

  if (!naming.valid) {
    safe = false;
    actions.push(`Fix migration naming: ${naming.errors.join(', ')}`);
  }

  if (conflicts.hasConflicts) {
    safe = false;
    actions.push(
      `Resolve migration conflicts: ${conflicts.conflicts.length} timestamp conflict(s)`
    );
  }

  if (check.dangerousMigrations.length > 0) {
    actions.push(
      `Review ${check.dangerousMigrations.length} potentially dangerous migration(s)`
    );
  }

  if (check.pendingMigrations > 0) {
    actions.push(
      `Plan to apply ${check.pendingMigrations} pending migration(s) during deployment`
    );
  }

  let message = `Database: ${check.totalMigrations} total, ${check.pendingMigrations} pending`;

  return {
    safe,
    message,
    actions,
  };
}
