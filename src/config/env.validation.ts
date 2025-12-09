export interface EnvironmentVariables {
  NODE_ENV: string;
  APP_NAME: string;
  PORT: number;
  API_VERSION: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  SECURITY_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_DB_URL?: string;
}

export const validateEnv = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const getString = (key: keyof EnvironmentVariables, fallback?: string) => {
    const value = config[key as string] ?? fallback;
    if (value === undefined || value === null || value === '') {
      throw new Error(`Environment variable ${String(key)} is required`);
    }
    return String(value);
  };

  const getNumber = (
    key: keyof EnvironmentVariables,
    fallback?: number,
  ): number => {
    const candidate = config[key as string];
    if (candidate === undefined || candidate === null) {
      if (fallback === undefined) {
        throw new Error(`Environment variable ${String(key)} is required`);
      }
      return fallback;
    }

    const parsed = Number(candidate);
    if (Number.isNaN(parsed)) {
      throw new Error(`Environment variable ${String(key)} must be a number`);
    }
    return parsed;
  };

  const getOptionalString = (
    key: keyof EnvironmentVariables,
  ): string | undefined => {
    const value = config[key as string];
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return String(value);
  };

  const nodeEnvValue = String(config.NODE_ENV ?? 'development');
  const isProduction = nodeEnvValue === 'production';

  return {
    NODE_ENV: getString('NODE_ENV', 'development'),
    APP_NAME: getString('APP_NAME', 'Agri Sync Pro'),
    PORT: getNumber('PORT', 3000),
    API_VERSION: getString('API_VERSION', '1'),
    DATABASE_URL: isProduction
      ? String(config.DATABASE_URL ?? '')
      : getString('DATABASE_URL'),
    JWT_SECRET: getString('JWT_SECRET'),
    JWT_EXPIRES_IN: getString('JWT_EXPIRES_IN', '1h'),
    REDIS_HOST: getString('REDIS_HOST'),
    REDIS_PORT: getNumber('REDIS_PORT', 6379),
    REDIS_PASSWORD: (config.REDIS_PASSWORD as string) ?? undefined,
    SECURITY_API_KEY: (config.SECURITY_API_KEY as string) ?? undefined,
    SUPABASE_URL: isProduction
      ? getString('SUPABASE_URL')
      : getOptionalString('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: isProduction
      ? getString('SUPABASE_SERVICE_ROLE_KEY')
      : getOptionalString('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_DB_URL: isProduction
      ? getString('SUPABASE_DB_URL')
      : getOptionalString('SUPABASE_DB_URL'),
  };
};
