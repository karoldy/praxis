import { Controller, Get } from '@nestjs/common';

/** 文档中心 —— 骨架占位。完整上传 / 文件夹 / 对象存储在业务层实现。 */
@Controller('documents')
export class DocumentsController {
  @Get()
  list(): { message: string } {
    return { message: '文档中心——待实现' };
  }
}