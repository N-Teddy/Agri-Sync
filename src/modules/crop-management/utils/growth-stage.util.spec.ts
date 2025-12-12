import { addDays, formatISO } from 'date-fns';

import { PlantingSeasonStatus } from '../../../common/enums/planting-season-status.enum';
import { calculateGrowthStage } from './growth-stage.util';

const baseDate = '2025-01-01';
const formatDaysAfterPlanting = (days: number) =>
	formatISO(addDays(new Date(baseDate), days), { representation: 'date' });
const stageExpectations: Array<[number, string]> = [
	[10, 'germination'],
	[30, 'vegetative'],
	[90, 'flowering'],
	[150, 'fruiting'],
	[250, 'maturation'],
];

describe('calculateGrowthStage', () => {
	it.each(stageExpectations)(
		'returns %s stage for %s days since planting',
		(daysSincePlanting, expectedStage) => {
			const stage = calculateGrowthStage({
				plantingDate: baseDate,
				actualHarvestDate: formatDaysAfterPlanting(
					Number(daysSincePlanting)
				),
				status: PlantingSeasonStatus.ACTIVE,
			});

			expect(stage).toBe(expectedStage);
		}
	);

	it('returns planned stage when planting date is in the future', () => {
		const stage = calculateGrowthStage({
			plantingDate: baseDate,
			actualHarvestDate: formatDaysAfterPlanting(-5),
			status: PlantingSeasonStatus.ACTIVE,
		});
		expect(stage).toBe('planned');
	});

	it('returns planned when status is PLANNED', () => {
		const stage = calculateGrowthStage({
			plantingDate: baseDate,
			status: PlantingSeasonStatus.PLANNED,
		});
		expect(stage).toBe('planned');
	});

	it('returns post_harvest when status is HARVESTED', () => {
		const stage = calculateGrowthStage({
			plantingDate: baseDate,
			status: PlantingSeasonStatus.HARVESTED,
			actualHarvestDate: formatDaysAfterPlanting(120),
		});
		expect(stage).toBe('post_harvest');
	});

	it('returns unknown when planting date is invalid', () => {
		const stage = calculateGrowthStage({
			plantingDate: 'invalid-date',
			status: PlantingSeasonStatus.ACTIVE,
		});
		expect(stage).toBe('unknown');
	});
});
