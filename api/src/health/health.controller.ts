import { Controller, Get } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '../db/drizzle.service';

@Controller('health')
export class HealthController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  async getHealth(): Promise<{ status: 'ok' }> {
    await this.drizzle.db.execute(sql`select 1`);
    return { status: 'ok' };
  }
}
