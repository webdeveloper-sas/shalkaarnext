/**
 * Environment-specific configuration loader
 * Handles loading and validating configs for different environments
 */

import { BACKEND_ENV_CONFIG, BackendConfig, parseBackendConfig } from './backend-config';
import { FRONTEND_ENV_CONFIG, FrontendConfig, parseFrontendConfig, verifyNoSensitiveExposure } from './frontend-config';
import { createEnvValidator } from './env-validator';

export type ConfigType = 'backend' | 'frontend';

/**
 * Get validation rules for a specific environment and config type
 */
export function getConfigForType(type: ConfigType, _env: NodeJS.ProcessEnv = process.env) {
  const allConfig = type === 'backend' ? BACKEND_ENV_CONFIG : FRONTEND_ENV_CONFIG;

  // Filter out configs for the other type
  return allConfig.filter(config => {
    if (config.environment === 'all' || !config.environment) return true;
    return config.environment === type || (type === 'backend' && config.environment === 'backend') || (type === 'frontend' && config.environment !== 'backend');
  });
}

/**
 * Validate and load backend configuration
 */
export function loadBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  const validator = createEnvValidator(BACKEND_ENV_CONFIG, env);

  try {
    validator.validate();
    console.log(validator.getSummary());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  return parseBackendConfig(env);
}

/**
 * Validate and load frontend configuration
 */
export function loadFrontendConfig(env: NodeJS.ProcessEnv = process.env): FrontendConfig {
  // Check for sensitive exposure
  const exposure = verifyNoSensitiveExposure(env);
  if (!exposure.valid) {
    console.error('\n❌ SECURITY ERROR: Sensitive variables exposed to frontend!\n');
    console.error('The following sensitive variables should NOT be prefixed with NEXT_PUBLIC_:\n');
    exposure.exposed.forEach(key => {
      console.error(`  • ${key}`);
    });
    console.error('\nThese will be visible to all clients and browsers!\n');
    process.exit(1);
  }

  const validator = createEnvValidator(FRONTEND_ENV_CONFIG, env);

  try {
    validator.validate();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  return parseFrontendConfig(env);
}

/**
 * Validate all environment variables (full validation)
 */
export function validateAllEnvironment(env: NodeJS.ProcessEnv = process.env, type?: ConfigType): boolean {
  const configs = type ? [getConfigForType(type, env)] : [BACKEND_ENV_CONFIG, FRONTEND_ENV_CONFIG];

  for (const config of configs) {
    const validator = createEnvValidator(config, env);
    try {
      validator.validate();
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  return true;
}

/**
 * Get environment information for logging
 */
export function getEnvironmentInfo(env: NodeJS.ProcessEnv = process.env): {
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
} {
  const nodeEnv = env.NODE_ENV || 'development';
  return {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isStaging: nodeEnv === 'staging',
  };
}
