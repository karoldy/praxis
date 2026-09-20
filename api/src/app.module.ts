import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { LoggingModule } from './logging/logging.module.js';
import { DrizzleModule } from './db/drizzle.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { NotesModule } from './modules/notes/notes.module.js';
import { ExamsModule } from './modules/exams/exams.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env', '.env.local'],
    }),
    LoggingModule,
    DrizzleModule,
    AuthModule,
    HealthModule,
    NotesModule,
    ExamsModule,
    DocumentsModule,
  ],
})
export class AppModule {}