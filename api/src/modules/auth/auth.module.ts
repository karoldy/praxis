import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DRIZZLE, type Db } from '../../db/drizzle.module.js';
import { createAuth, type Auth, type AuthConfig } from './auth.js';
import { AuthGuard } from './auth.guard.js';
import { AUTH } from './constants.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AUTH,
      useFactory: (db: Db, config: ConfigService): Auth =>
        createAuth(db, {
          baseUrl: config.get<string>('PRAXIS_PUBLIC_URL') ?? 'http://127.0.0.1:13000',
          secret: config.get<string>('PRAXIS_AUTH_SECRET') ?? '',
          trustedOrigins: [config.get<string>('PRAXIS_CORS_ORIGIN') ?? 'http://127.0.0.1:15173'],
        } satisfies AuthConfig),
      inject: [DRIZZLE, ConfigService],
    },
    AuthGuard,
  ],
  exports: [AUTH, AuthGuard],
})
export class AuthModule {}