import type { Repository } from 'typeorm';

import { AlertSeverity } from '../../../src/common/enums/alert-severity.enum';
import { AlertType } from '../../../src/common/enums/alert-type.enum';
import type { Alert } from '../../../src/entities/alert.entity';
import type { Field } from '../../../src/entities/field.entity';
import { WeatherAlertsService } from '../../../src/modules/weather/weather-alerts.service';

const createMockRepository = () => ({
	findOne: jest.fn(),
	save: jest.fn(async (alert: Alert) => ({ ...alert, id: 'alert-id' })),
	create: jest.fn((alert: Partial<Alert>) => ({ ...alert }) as Alert),
});

describe('WeatherAlertsService', () => {
	let service: WeatherAlertsService;
	let repository: ReturnType<typeof createMockRepository>;
	const field: Field = {
		id: 'field-1',
		name: 'North Block',
	} as Field;

	beforeEach(() => {
		repository = createMockRepository();
		service = new WeatherAlertsService(
			repository as unknown as Repository<Alert>
		);
	});

	it('creates heavy rain alert when rainfall threshold exceeded', async () => {
		repository.findOne.mockResolvedValue(null);

		const alerts = await service.evaluate(field, {
			recordedAt: new Date('2025-01-01T10:00:00Z'),
			rainfallMm: 60,
			temperatureC: 22,
			humidityPercent: 70,
			isForecast: true,
			source: 'test',
		});

		expect(alerts).toHaveLength(1);
		expect(alerts[0].alertType).toBe(AlertType.HEAVY_RAIN);
		expect(alerts[0].severity).toBe(AlertSeverity.HIGH);
		expect(repository.save).toHaveBeenCalledTimes(1);
	});

	it('suppresses duplicate alerts within suppression window', async () => {
		repository.findOne.mockResolvedValue({
			id: 'existing',
			alertType: AlertType.HEAVY_RAIN,
			triggeredAt: new Date(),
		} as Alert);

		const alerts = await service.evaluate(field, {
			recordedAt: new Date(),
			rainfallMm: 75,
			isForecast: false,
			source: 'test',
		});

		expect(alerts).toHaveLength(0);
		expect(repository.save).not.toHaveBeenCalled();
	});
});
