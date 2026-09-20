import { Controller, Get } from '@nestjs/common';

/** 考试中心 —— 骨架占位。完整题库 / 组卷 / 作答在业务层实现。 */
@Controller('exams')
export class ExamsController {
  @Get()
  list(): { message: string } {
    return { message: '考试中心——待实现' };
  }
}