import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { CurrentUser } from '../../auth/current-user.decorator.js';

@Controller('api/identity')
@UseGuards(AuthGuard)
export class IdentityController {
  @Get()
  status(@CurrentUser() user?: { id: string; email: string; name: string }) {
    return { module: 'identity', userId: user?.id ?? null };
  }
}
