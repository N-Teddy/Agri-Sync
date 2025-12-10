import type {
  HealthCheckResult,
  HealthIndicatorFunction,
} from '@nestjs/terminus';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  const healthCheck = {
    check: jest.fn(),
  };
  const memoryIndicator = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  beforeEach(() => {
    healthCheck.check.mockReset();
    memoryIndicator.checkHeap.mockReset();
    memoryIndicator.checkRSS.mockReset();

    healthService = new HealthService(
      healthCheck as never,
      memoryIndicator as never,
    );
  });

  it('runs memory health indicators', async () => {
    const expected: HealthCheckResult = {
      status: 'ok',
      info: {},
      error: {},
      details: {},
    };

    healthCheck.check.mockImplementation(
      async (indicators: HealthIndicatorFunction[]) => {
        for (const indicator of indicators) {
          await indicator();
        }
        return expected;
      },
    );

    const result = await healthService.check();

    expect(healthCheck.check).toHaveBeenCalledTimes(1);
    expect(memoryIndicator.checkHeap).toHaveBeenCalledWith(
      'memory_heap',
      expect.any(Number),
    );
    expect(memoryIndicator.checkRSS).toHaveBeenCalledWith(
      'memory_rss',
      expect.any(Number),
    );
    expect(result).toBe(expected);
  });
});
