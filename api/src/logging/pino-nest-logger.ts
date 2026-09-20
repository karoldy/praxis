import { LoggerService } from '@nestjs/common';
import type { Logger } from 'pino';

/**
 * 将 pino Logger 适配为 NestJS 的 LoggerService，供 app.useLogger() 使用，
 * 使 Nest 内部日志统一走 pino（含文件滚动）。错误消息保留堆栈（Nest 的
 * error(messageOrError, stack?, context?) 约定映射到 pino 的 err/context 字段）。
 */
export class PinoNestLogger implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: unknown, ...optional: unknown[]): void {
    this.logger.info(meta(optional), String(message));
  }

  error(message: unknown, ...optional: unknown[]): void {
    const [stack, context] = optional;
    const metaObj = { context: context ?? undefined };

    if (message instanceof Error) {
      this.logger.error(metaObj, message.message);
      if (stack) {
        this.logger.error(metaObj, String(message.stack ?? message));
      }
    } else {
      const text = [String(message), stack ? String(stack) : ''].filter(Boolean).join('\n');
      this.logger.error(metaObj, text);
    }
  }

  warn(message: unknown, ...optional: unknown[]): void {
    this.logger.warn(meta(optional), String(message));
  }

  debug?(message: unknown, ...optional: unknown[]): void {
    this.logger.debug(meta(optional), String(message));
  }

  verbose?(message: unknown, ...optional: unknown[]): void {
    this.logger.trace(meta(optional), String(message));
  }
}

/** Nest 的第三个参数常是模块/路由上下文，转成 pino 的 context 字段方便检索。 */
function meta(optional: unknown[]): { context?: string } {
  return { context: optional[0] ? String(optional[0]) : undefined };
}