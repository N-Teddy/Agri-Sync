import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';

import { HealthService } from '../../../src/modules/health/health.service';

describe('HealthService', () => {
	const mockHealthCheck = {
		check: jest.fn(),
	};
	const mockMemoryIndicator = {
		checkHeap: jest.fn(),
		checkRSS: jest.fn(),
	};

	beforeEach(() => {
		mockHealthCheck.check.mockResolvedValue({ status: 'ok' });
		mockMemoryIndicator.checkHeap.mockResolvedValue({ status: 'up' });
		mockMemoryIndicator.checkRSS.mockResolvedValue({ status: 'up' });
	});

	it('runs configured memory checks', async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				HealthService,
				{ provide: HealthCheckService, useValue: mockHealthCheck },
				{
					provide: MemoryHealthIndicator,
					useValue: mockMemoryIndicator,
				},
			],
		}).compile();

		const service = moduleRef.get(HealthService);
		await service.check();

		expect(mockHealthCheck.check).toHaveBeenCalledTimes(1);
		const [[callbacks]] = mockHealthCheck.check.mock.calls;
		expect(callbacks).toHaveLength(2);
	});
});
