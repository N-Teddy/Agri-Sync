import type { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { AppConfiguration } from '../config/configuration';

interface SupabaseSettings {
  url: string;
  serviceRoleKey?: string;
  databaseUrl: string;
}

/**
 * Centralizes access to Supabase connection details.
 * Keeps a singleton PG pool handy for lightweight health checks if needed.
 */
export class SupabaseConnectionService {
  private pool?: Pool;

  constructor(
    private readonly configService: ConfigService<AppConfiguration>,
  ) {}

  public getDatabaseUrl(): string {
    const supabase = this.ensureConfig();
    return supabase.databaseUrl;
  }

  public getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: this.getDatabaseUrl(),
        ssl: { rejectUnauthorized: false },
      });
    }
    return this.pool;
  }

  private ensureConfig(): SupabaseSettings {
    const supabaseConfig =
      this.configService.get<AppConfiguration['supabase']>('supabase');

    if (!supabaseConfig?.databaseUrl) {
      throw new Error(
        'Supabase database URL is not configured for production environment',
      );
    }

    return {
      url: supabaseConfig.url ?? '',
      serviceRoleKey: supabaseConfig.serviceRoleKey,
      databaseUrl: supabaseConfig.databaseUrl,
    };
  }
}
