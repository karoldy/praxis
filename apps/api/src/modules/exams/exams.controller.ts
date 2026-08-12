import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';

@Controller('api/exams')
@UseGuards(AuthGuard)
export class ExamsController {
  @Get()
  status() {
    return { module: 'exams' };
  }
}
