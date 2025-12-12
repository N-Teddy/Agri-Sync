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

interface FieldPerformanceItem {
	fieldId: string;
	fieldName: string;
	currentCrop?: string | null;
	profitability: number;
	status: 'profitable' | 'break-even' | 'loss' | 'no-data';
	totalCosts: number;
	totalRevenue: number;
}

interface AlertStatistics {
	total: number;
	unacknowledged: number;
	bySevertiy: {
		low: number;
		medium: number;
		high: number;
	};
}

export interface DashboardSummary {
	statistics: {
		totalFields: number;
		totalPlantations: number;
		totalActivities: number;
		totalAlerts: number;
	};
	fields: Array<{
		id: string;
		name: string;
		areaHectares?: string;
		currentCrop?: string | null;
	}>;
	weatherOverview: WeatherOverviewItem[];
	recentActivities: FieldActivity[];
	activeAlerts: Alert[];
	alertStatistics: AlertStatistics;
	financialSnapshot: {
		totals: {
			costs: number;
			revenue: number;
			profit: number;
			profitMargin: number;
		};
		perField: FieldFinancialSummary[];
	};
	fieldPerformance: FieldPerformanceItem[];
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
	) { }

	async getSummary(ownerId: string): Promise<DashboardSummary> {
		const fields = await this.fieldsRepository.find({
			where: { plantation: { owner: { id: ownerId } } },
			relations: ['plantation'],
			order: { createdAt: 'DESC' },
		});

		const fieldIds = fields.map((field) => field.id);

		// Get unique plantation count
		const plantationIds = [
			...new Set(fields.map((f) => f.plantation.id)),
		];

		const [
			weatherOverview,
			recentActivities,
			activeAlerts,
			allAlerts,
			financialSummaries,
			totalActivitiesCount,
		] = await Promise.all([
			this.getWeatherOverview(fields),
			this.getRecentActivities(fieldIds),
			this.getActiveAlerts(fieldIds),
			this.getAllAlerts(fieldIds),
			this.financialRecordsService.summarizeFields(fields),
			this.getTotalActivitiesCount(fieldIds),
		]);

		// Calculate financial totals
		const totals = financialSummaries.reduce(
			(acc, summary) => {
				acc.costs += summary.totalCostsXaf;
				acc.revenue += summary.totalRevenueXaf;
				return acc;
			},
			{ costs: 0, revenue: 0 }
		);
		const profit = totals.revenue - totals.costs;
		const profitMargin =
			totals.revenue > 0 ? (profit / totals.revenue) * 100 : 0;

		// Calculate alert statistics
		const alertStatistics = this.calculateAlertStatistics(allAlerts);

		// Calculate field performance
		const fieldPerformance = this.calculateFieldPerformance(
			fields,
			financialSummaries
		);

		return {
			statistics: {
				totalFields: fields.length,
				totalPlantations: plantationIds.length,
				totalActivities: totalActivitiesCount,
				totalAlerts: allAlerts.length,
			},
			fields: fields.map((field) => ({
				id: field.id,
				name: field.name,
				areaHectares: field.areaHectares,
				currentCrop: field.currentCrop ?? null,
			})),
			weatherOverview,
			recentActivities,
			activeAlerts,
			alertStatistics,
			financialSnapshot: {
				totals: {
					costs: Number(totals.costs.toFixed(2)),
					revenue: Number(totals.revenue.toFixed(2)),
					profit: Number(profit.toFixed(2)),
					profitMargin: Number(profitMargin.toFixed(2)),
				},
				perField: financialSummaries,
			},
			fieldPerformance,
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

	private async getAllAlerts(fieldIds: string[]): Promise<Alert[]> {
		if (!fieldIds.length) {
			return [];
		}

		return this.alertsRepository.find({
			where: {
				field: { id: In(fieldIds) },
			},
			relations: { field: true },
		});
	}

	private async getTotalActivitiesCount(
		fieldIds: string[]
	): Promise<number> {
		if (!fieldIds.length) {
			return 0;
		}

		return this.fieldActivitiesRepository.count({
			where: { field: { id: In(fieldIds) } },
		});
	}

	private calculateAlertStatistics(alerts: Alert[]): AlertStatistics {
		const unacknowledged = alerts.filter((a) => !a.acknowledgedAt).length;

		const bySeverity = alerts.reduce(
			(acc, alert) => {
				if (alert.severity === 'low') acc.low++;
				else if (alert.severity === 'medium') acc.medium++;
				else if (alert.severity === 'high') acc.high++;
				return acc;
			},
			{ low: 0, medium: 0, high: 0 }
		);

		return {
			total: alerts.length,
			unacknowledged,
			bySevertiy: bySeverity,
		};
	}

	private calculateFieldPerformance(
		fields: Field[],
		financialSummaries: FieldFinancialSummary[]
	): FieldPerformanceItem[] {
		return fields.map((field) => {
			const summary = financialSummaries.find(
				(s) => s.fieldId === field.id
			);

			if (!summary) {
				return {
					fieldId: field.id,
					fieldName: field.name,
					currentCrop: field.currentCrop,
					profitability: 0,
					status: 'no-data' as const,
					totalCosts: 0,
					totalRevenue: 0,
				};
			}

			const profitability =
				summary.totalRevenueXaf - summary.totalCostsXaf;
			let status: 'profitable' | 'break-even' | 'loss' | 'no-data';

			if (profitability > 100) {
				status = 'profitable';
			} else if (profitability >= -100 && profitability <= 100) {
				status = 'break-even';
			} else {
				status = 'loss';
			}

			return {
				fieldId: field.id,
				fieldName: field.name,
				currentCrop: field.currentCrop,
				profitability: Number(profitability.toFixed(2)),
				status,
				totalCosts: Number(summary.totalCostsXaf.toFixed(2)),
				totalRevenue: Number(summary.totalRevenueXaf.toFixed(2)),
			};
		});
	}
}
