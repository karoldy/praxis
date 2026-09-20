import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DbHealthIndicator } from './db.health.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DbHealthIndicator,
  ) {}

  /** GET /api/health
   * 注：Terminus 在指标失败时仍返回 HTTP 200，只在响应体里标记 status=error，
   * 供负载/探活区分「进程存活」与「依赖健康」。
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('db')]);
  }
}