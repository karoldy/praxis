import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DrizzleService } from '../db/drizzle.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DrizzleService,
          useValue: {
            db: { execute: () => Promise.resolve(undefined) },
          },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns ok after the database answers', async () => {
    await expect(controller.getHealth()).resolves.toEqual({ status: 'ok' });
  });
});
