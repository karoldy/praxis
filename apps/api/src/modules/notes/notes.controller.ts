import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';

@Controller('api/notes')
@UseGuards(AuthGuard)
export class NotesController {
  @Get()
  status() {
    return { module: 'notes' };
  }
}
