import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { databaseProvider } from './db/index.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { NotesModule } from './modules/notes/notes.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import { ExamsModule } from './modules/exams/exams.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotesModule,
    TasksModule,
    ExamsModule,
    IdentityModule,
  ],
  controllers: [HealthController],
  providers: [databaseProvider, AuthMiddleware],
})
export class AppModule {}
