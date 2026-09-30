import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('PRAXIS_PORT');
  await app.listen(port, '127.0.0.1');
}

void bootstrap();
