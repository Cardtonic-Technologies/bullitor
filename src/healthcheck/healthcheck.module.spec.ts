import { Test } from '@nestjs/testing';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckModule } from './healthcheck.module';

describe(HealthcheckModule, () => {
  let healthController: HealthcheckController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthcheckModule],
    }).compile();

    healthController = moduleRef.get<HealthcheckController>(HealthcheckController);
  });

  it('returns healthy status', async () => {
    expect(healthController.healthy()).toBe('OK');
  });
});
