import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { databaseProvider } from './db/index.js';
import { AuthMiddleware } from './auth/auth.middleware.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
  providers: [databaseProvider, AuthMiddleware],
})
export class AppModule {}
