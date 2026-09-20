import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDb } from './db.js';
import type { Db } from './db.js';

/** Drizzle 客户端注入 token。 */
export const DRIZZLE = Symbol('DRIZZLE');

export type { Db };

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (config: ConfigService): Db =>
        createDb(config.get<string>('PRAXIS_DATABASE_URL')!),
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}