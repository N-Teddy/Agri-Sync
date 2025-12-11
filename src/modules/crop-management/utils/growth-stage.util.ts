import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

import { PlantingSeasonStatus } from '../../../common/enums/planting-season-status.enum';

interface CalculateGrowthStageInput {
  plantingDate: string;
  actualHarvestDate?: string;
  status: PlantingSeasonStatus;
}

const STAGE_THRESHOLDS: { label: string; maxDays: number }[] = [
  { label: 'germination', maxDays: 14 },
  { label: 'vegetative', maxDays: 60 },
  { label: 'flowering', maxDays: 120 },
  { label: 'fruiting', maxDays: 180 },
];

export const calculateGrowthStage = ({
  plantingDate,
  actualHarvestDate,
  status,
}: CalculateGrowthStageInput): string => {
  if (status === PlantingSeasonStatus.PLANNED) {
    return 'planned';
  }

  if (status === PlantingSeasonStatus.HARVESTED) {
    return 'post_harvest';
  }

  const parsedPlantingDate = parseISO(plantingDate);
  if (!isValid(parsedPlantingDate)) {
    return 'unknown';
  }

  const comparisonDate = actualHarvestDate
    ? parseISO(actualHarvestDate)
    : new Date();

  if (!isValid(comparisonDate)) {
    return 'unknown';
  }

  const daysSincePlanting = differenceInCalendarDays(
    comparisonDate,
    parsedPlantingDate,
  );

  if (daysSincePlanting < 0) {
    return 'planned';
  }

  for (const threshold of STAGE_THRESHOLDS) {
    if (daysSincePlanting <= threshold.maxDays) {
      return threshold.label;
    }
  }

  return 'maturation';
};
