/**
 * Environment Variable Validation Utility
 * Provides centralized validation and typing for environment variables
 * Supports development, staging, and production environments
 */

export type Environment = 'development' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Validation result for a single environment variable
 */
export interface ValidationResult {
  key: string;
  valid: boolean;
  value?: string;
  error?: string;
  required: boolean;
  environment: 'all' | Environment;
}

/**
 * Configuration for an environment variable
 */
export interface EnvVarConfig {
  key: string;
  required?: boolean;
  requiredIn?: Environment[];
  description: string;
  type?: 'string' | 'number' | 'boolean' | 'url';
  defaultValue?: string | number | boolean;
  validateFn?: (value: string) => boolean;
  environment?: 'all' | 'backend' | 'frontend';
  sensitive?: boolean; // Don't log the value
}

/**
 * Validation error details
 */
export interface ValidationError {
  message: string;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

/**
 * Environment validator class
 */
export class EnvValidator {
  private env: NodeJS.ProcessEnv;
  private currentEnv: Environment;
  private config: EnvVarConfig[];
  private results: ValidationResult[] = [];

  constructor(
    env: NodeJS.ProcessEnv = process.env,
    environment: Environment = (process.env.NODE_ENV as Environment) || 'development',
    config: EnvVarConfig[] = []
  ) {
    this.env = env;
    this.currentEnv = environment;
    this.config = config;
  }

  /**
   * Validate all configured environment variables
   */
  validate(): boolean {
    this.results = [];
    const errors: ValidationError = {
      message: '',
      missing: [],
      invalid: [],
      warnings: [],
    };

    for (const varConfig of this.config) {
      const result = this.validateVariable(varConfig);
      this.results.push(result);

      if (!result.valid) {
        if (result.required) {
          errors.missing.push(`${varConfig.key}: ${varConfig.description}`);
        } else {
          errors.invalid.push(`${varConfig.key}: ${result.error}`);
        }
      }
    }

    if (errors.missing.length > 0 || errors.invalid.length > 0) {
      errors.message = this.formatErrorMessage(errors);
      throw new Error(errors.message);
    }

    return true;
  }

  /**
   * Validate a single environment variable
   */
  private validateVariable(config: EnvVarConfig): ValidationResult {
    const value = this.env[config.key];
    const isRequired = this.isRequiredInEnvironment(config);

    if (!value) {
      if (isRequired) {
        return {
          key: config.key,
          valid: false,
          required: true,
          error: `Missing required environment variable`,
          environment: this.currentEnv,
        };
      }

      // Use default value if available
      if (config.defaultValue !== undefined) {
        return {
          key: config.key,
          valid: true,
          value: String(config.defaultValue),
          required: false,
          environment: this.currentEnv,
        };
      }

      return {
        key: config.key,
        valid: true,
        required: false,
        environment: this.currentEnv,
      };
    }

    // Type validation
    if (config.type) {
      const typeValid = this.validateType(value, config.type);
      if (!typeValid) {
        return {
          key: config.key,
          valid: false,
          required: isRequired,
          error: `Invalid type for ${config.key}: expected ${config.type}`,
          environment: this.currentEnv,
        };
      }
    }

    // Custom validation
    if (config.validateFn && !config.validateFn(value)) {
      return {
        key: config.key,
        valid: false,
        required: isRequired,
        error: `Validation failed for ${config.key}`,
        environment: this.currentEnv,
      };
    }

    return {
      key: config.key,
      valid: true,
      value,
      required: isRequired,
      environment: this.currentEnv,
    };
  }

  /**
   * Check if a variable is required in the current environment
   */
  private isRequiredInEnvironment(config: EnvVarConfig): boolean {
    const required = config.required ?? false;
    const requiredIn = config.requiredIn ?? [];

    if (required && requiredIn.length === 0) {
      return true; // Required in all environments
    }

    return requiredIn.includes(this.currentEnv);
  }

  /**
   * Type validation
   */
  private validateType(value: string, type: string): boolean {
    switch (type) {
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value === 'true' || value === 'false' || value === '0' || value === '1';
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'string':
      default:
        return true;
    }
  }

  /**
   * Format error message
   */
  private formatErrorMessage(errors: ValidationError): string {
    let message = '\n❌ Environment Configuration Error\n';
    message += '='.repeat(50) + '\n\n';

    if (errors.missing.length > 0) {
      message += `🔴 MISSING REQUIRED VARIABLES (${errors.missing.length}):\n`;
      errors.missing.forEach(m => {
        message += `  • ${m}\n`;
      });
      message += '\n';
    }

    if (errors.invalid.length > 0) {
      message += `🟡 INVALID VARIABLES (${errors.invalid.length}):\n`;
      errors.invalid.forEach(i => {
        message += `  • ${i}\n`;
      });
      message += '\n';
    }

    message += `Environment: ${this.currentEnv} (NODE_ENV=${this.env.NODE_ENV})\n`;
    message += '='.repeat(50);

    return message;
  }

  /**
   * Get validated value
   */
  getValue(key: string): string | undefined {
    const result = this.results.find(r => r.key === key);
    return result?.value || this.env[key];
  }

  /**
   * Get validation results
   */
  getResults(): ValidationResult[] {
    return this.results;
  }

  /**
   * Get summary report
   */
  getSummary(): string {
    const total = this.results.length;
    const valid = this.results.filter(r => r.valid).length;
    const required = this.results.filter(r => r.required).length;
    const sensitive = this.config.filter(c => c.sensitive).length;

    let summary = '\n📋 Environment Configuration Summary\n';
    summary += '='.repeat(50) + '\n';
    summary += `Environment:       ${this.currentEnv}\n`;
    summary += `Total Variables:   ${total}\n`;
    summary += `Valid:             ${valid}/${total}\n`;
    summary += `Required:          ${required}\n`;
    summary += `Sensitive:         ${sensitive}\n`;
    summary += '='.repeat(50) + '\n';

    return summary;
  }
}

/**
 * Create a validator with standard configuration
 */
export function createEnvValidator(
  config: EnvVarConfig[],
  env: NodeJS.ProcessEnv = process.env
): EnvValidator {
  const environment = (env.NODE_ENV as Environment) || 'development';
  return new EnvValidator(env, environment, config);
}

/**
 * Parse environment variable as different types
 */
export function parseEnvValue(value: string | undefined, type: 'string' | 'number' | 'boolean' = 'string'): any {
  if (!value) return undefined;

  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === '1' || value === 'yes';
    case 'string':
    default:
      return value;
  }
}

/**
 * Get safe environment summary (no sensitive values)
 */
export function getEnvSummary(config: EnvVarConfig[], env: NodeJS.ProcessEnv = process.env): string {
  let summary = '\n📦 Environment Variables Loaded\n';
  summary += '='.repeat(50) + '\n';

  config.forEach(varConfig => {
    const value = env[varConfig.key];
    const display = varConfig.sensitive
      ? value ? '****' : 'NOT SET'
      : value || 'NOT SET (using default)';

    summary += `${varConfig.key.padEnd(30)} ${display}\n`;
  });

  summary += '='.repeat(50) + '\n';
  return summary;
}
