import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { DRIZZLE, type Db } from '../../db/drizzle.module.js';

/**
 * 数据库连通性指标：执行 `SELECT 1`。
 * 直接返回 HealthIndicatorResult（{ key: { status } }），不外借 HealthIndicatorService，
 * 由 Terminus 的 HealthCheckService 聚合到 details.db。
 */
@Injectable()
export class DbHealthIndicator {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.db.execute(sql`select 1`);
      return { [key]: { status: 'up' } };
    } catch (error) {
      return {
        [key]: { status: 'down', message: (error as Error).message },
      };
    }
  }
}