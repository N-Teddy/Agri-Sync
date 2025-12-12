import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { Alert } from '../../entities/alert.entity';
import { Field } from '../../entities/field.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import {
	FieldFinancialSummary,
	FinancialRecordsService,
} from '../financial/financial-records.service';

interface WeatherOverviewItem {
	fieldId: string;
	fieldName: string;
	recordedAt?: Date;
	temperatureC?: number;
	humidityPercent?: number;
	rainfallMm?: number;
	source?: string;
}

export interface DashboardSummary {
	fields: Array<{
		id: string;
		name: string;
		areaHectares?: string;
		currentCrop?: string | null;
	}>;
	weatherOverview: WeatherOverviewItem[];
	recentActivities: FieldActivity[];
	activeAlerts: Alert[];
	financialSnapshot: {
		totals: {
			costs: number;
			revenue: number;
			profit: number;
		};
		perField: FieldFinancialSummary[];
	};
}

@Injectable()
export class DashboardService {
	constructor(
		@InjectRepository(Field)
		private readonly fieldsRepository: Repository<Field>,
		@InjectRepository(FieldActivity)
		private readonly fieldActivitiesRepository: Repository<FieldActivity>,
		@InjectRepository(Alert)
		private readonly alertsRepository: Repository<Alert>,
		@InjectRepository(WeatherData)
		private readonly weatherRepository: Repository<WeatherData>,
		private readonly financialRecordsService: FinancialRecordsService
	) {}

	async getSummary(ownerId: string): Promise<DashboardSummary> {
		const fields = await this.fieldsRepository.find({
			where: { plantation: { owner: { id: ownerId } } },
			order: { createdAt: 'DESC' },
		});

		const fieldIds = fields.map((field) => field.id);

		const [
			weatherOverview,
			recentActivities,
			activeAlerts,
			financialSummaries,
		] = await Promise.all([
			this.getWeatherOverview(fields),
			this.getRecentActivities(fieldIds),
			this.getActiveAlerts(fieldIds),
			this.financialRecordsService.summarizeFields(fields),
		]);

		const totals = financialSummaries.reduce(
			(acc, summary) => {
				acc.costs += summary.totalCostsXaf;
				acc.revenue += summary.totalRevenueXaf;
				return acc;
			},
			{ costs: 0, revenue: 0 }
		);
		const profit = totals.revenue - totals.costs;

		return {
			fields: fields.map((field) => ({
				id: field.id,
				name: field.name,
				areaHectares: field.areaHectares,
				currentCrop: field.currentCrop ?? null,
			})),
			weatherOverview,
			recentActivities,
			activeAlerts,
			financialSnapshot: {
				totals: {
					costs: Number(totals.costs.toFixed(2)),
					revenue: Number(totals.revenue.toFixed(2)),
					profit: Number(profit.toFixed(2)),
				},
				perField: financialSummaries,
			},
		};
	}

	private async getWeatherOverview(
		fields: Field[]
	): Promise<WeatherOverviewItem[]> {
		if (!fields.length) {
			return [];
		}

		const latestReadings = await Promise.all(
			fields.map(async (field) => {
				const actualReading = await this.weatherRepository.findOne({
					where: { field: { id: field.id }, isForecast: false },
					order: { recordedAt: 'DESC' },
				});

				const fallback = actualReading
					? actualReading
					: await this.weatherRepository.findOne({
							where: { field: { id: field.id } },
							order: { recordedAt: 'DESC' },
						});

				return {
					fieldId: field.id,
					fieldName: field.name,
					recordedAt: fallback?.recordedAt,
					temperatureC: fallback
						? this.parseNumericValue(fallback.temperatureC)
						: undefined,
					humidityPercent: fallback
						? this.parseNumericValue(fallback.humidityPercent)
						: undefined,
					rainfallMm: fallback
						? this.parseNumericValue(fallback.rainfallMm)
						: undefined,
					source: fallback?.source,
				};
			})
		);

		return latestReadings;
	}

	private async getRecentActivities(
		fieldIds: string[]
	): Promise<FieldActivity[]> {
		if (!fieldIds.length) {
			return [];
		}

		return this.fieldActivitiesRepository.find({
			where: { field: { id: In(fieldIds) } },
			relations: { field: true, plantingSeason: true },
			order: {
				activityDate: 'DESC',
				createdAt: 'DESC',
			},
			take: 10,
		});
	}

	private async getActiveAlerts(fieldIds: string[]): Promise<Alert[]> {
		if (!fieldIds.length) {
			return [];
		}

		return this.alertsRepository.find({
			where: {
				field: { id: In(fieldIds) },
				resolvedAt: IsNull(),
			},
			relations: { field: true },
			order: { triggeredAt: 'DESC' },
			take: 10,
		});
	}

	private parseNumericValue(value?: string | null): number | undefined {
		if (!value) {
			return undefined;
		}

		const parsed = parseFloat(value);
		return Number.isNaN(parsed) ? undefined : parsed;
	}
}
