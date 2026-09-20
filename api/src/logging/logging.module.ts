import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { pino, type Logger } from 'pino';
import { pinoHttp, type HttpLogger } from 'pino-http';
import pretty from 'pino-pretty';
import pinoRoll from 'pino-roll';

const LOG_DIR = 'logs';

/**
 * 构建 pino Logger。
 * - 文件滚动日志（PRAXIS_LOG_FILE=true 或 production）：pino-roll 按日期+大小分割写 logs/，
 *   对应设计 §5.1 的「文件型应用运行日志」。异步：pino-roll 工厂返回 Promise<SonicBoom>。
 * - console：dev 用 pino-pretty 美化；生产直接结构化 JSON。
 */
export async function buildLogger(options: {
  level: string;
  file: boolean;
  production: boolean;
}): Promise<Logger> {
  if (options.file) {
    mkdirSync(LOG_DIR, { recursive: true });
    const dest = await pinoRoll({
      file: join(LOG_DIR, 'app.log'),
      frequency: 'daily',
      size: '10MB',
    });
    return pino({ level: options.level }, dest);
  }

  if (options.production) {
    return pino({ level: options.level });
  }

  const prettyStream = pretty({
    colorize: true,
    translateTime: 'SYS:HH:MM:ss',
    singleLine: true,
  });
  return pino({ level: options.level }, prettyStream);
}

/** 构建 pino-http 请求日志中间件（HTTP 访问日志）。 */
export function buildHttpLogger(logger: Logger): HttpLogger {
  return pinoHttp({ logger });
}

/** 注入 token。 */
export const PINO_LOGGER = Symbol('PINO_LOGGER');
export const PINO_HTTP_LOGGER = Symbol('PINO_HTTP_LOGGER');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PINO_LOGGER,
      useFactory: async (config: ConfigService): Promise<Logger> =>
        buildLogger({
          level: config.get<string>('PRAXIS_LOG_LEVEL') ?? 'debug',
          file: config.get<boolean>('PRAXIS_LOG_FILE') ?? false,
          production: (config.get<string>('PRAXIS_NODE_ENV') ?? 'development') === 'production',
        }),
      inject: [ConfigService],
    },
    {
      provide: PINO_HTTP_LOGGER,
      useFactory: (logger: Logger): HttpLogger => buildHttpLogger(logger),
      inject: [PINO_LOGGER],
    },
  ],
  exports: [PINO_LOGGER, PINO_HTTP_LOGGER],
})
export class LoggingModule {}