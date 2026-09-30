import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema';

export type Db = PostgresJsDatabase<typeof schema>;

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  readonly db: Db;
  private readonly client: Sql;

  constructor(config: ConfigService) {
    const databaseUrl = config.getOrThrow<string>('PRAXIS_DATABASE_URL');
    this.client = postgres(databaseUrl, { max: 10 });
    this.db = drizzle(this.client, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
