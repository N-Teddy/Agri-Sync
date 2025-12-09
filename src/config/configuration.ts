export interface AppConfiguration {
  app: {
    name: string;
    env: string;
    port: number;
    apiVersion: string;
    globalPrefix: string;
  };
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  security: {
    apiKey?: string;
  };
}

const configuration = (): AppConfiguration => {
  const env = process.env.NODE_ENV ?? 'development';

  return {
    app: {
      name: process.env.APP_NAME ?? 'Agri Sync Pro',
      env,
      port: Number(process.env.PORT) || 3000,
      apiVersion: process.env.API_VERSION ?? '1',
      globalPrefix: 'api',
    },
    database: {
      url: process.env.DATABASE_URL ?? '',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? '',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    },
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    },
    security: {
      apiKey: process.env.SECURITY_API_KEY,
    },
  };
};

export default configuration;
