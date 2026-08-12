import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';

@Controller('api/tasks')
@UseGuards(AuthGuard)
export class TasksController {
  @Get()
  status() {
    return { module: 'tasks' };
  }
}
