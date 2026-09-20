import { Controller, Get } from '@nestjs/common';

/** 学习中心 —— 骨架占位。完整 CRUD / i18n / 导入在业务层实现。 */
@Controller('notes')
export class NotesController {
  @Get()
  list(): { message: string } {
    return { message: '学习中心——待实现' };
  }
}