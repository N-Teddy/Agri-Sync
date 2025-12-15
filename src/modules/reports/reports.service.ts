import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';

import { FinancialRecordType } from '../../common/enums/financial-record-type.enum';
import { Alert } from '../../entities/alert.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import { FieldAccessService } from '../fields/field-access.service';
import {
	FieldPerformanceReport,
	SeasonalSummaryReport,
	WeatherImpactReport,
} from './interfaces/report.interfaces';

@Injectable()
export class ReportsService {
	constructor(
		@InjectRepository(FieldActivity)
		private readonly activitiesRepository: Repository<FieldActivity>,
		@InjectRepository(FinancialRecord)
		private readonly financialRepository: Repository<FinancialRecord>,
		@InjectRepository(PlantingSeason)
		private readonly seasonsRepository: Repository<PlantingSeason>,
		@InjectRepository(WeatherData)
		private readonly weatherRepository: Repository<WeatherData>,
		@InjectRepository(Alert)
		private readonly alertsRepository: Repository<Alert>,
		private readonly fieldAccessService: FieldAccessService
	) {}

	async generateFieldPerformanceReport(
		userId: string,
		fieldId: string
	): Promise<FieldPerformanceReport> {
		// Verify ownership
		const field = await this.fieldAccessService.getOwnedField(
			fieldId,
			userId
		);

		// Get current season
		const currentSeason = await this.seasonsRepository.findOne({
			where: { field: { id: fieldId }, actualHarvestDate: IsNull() },
			order: { plantingDate: 'DESC' },
		});

		// Get all activities
		const activities = await this.activitiesRepository.find({
			where: { field: { id: fieldId } },
		});

		// Get financial records
		const financialRecords = await this.financialRepository.find({
			where: { field: { id: fieldId } },
		});

		// Calculate financials
		const totalCosts = financialRecords
			.filter((r) => r.recordType === FinancialRecordType.COST)
			.reduce((sum, r) => sum + parseFloat(r.amountXaf || '0'), 0);

		const totalRevenue = financialRecords
			.filter((r) => r.recordType === FinancialRecordType.REVENUE)
			.reduce((sum, r) => sum + parseFloat(r.amountXaf || '0'), 0);

		const grossProfit = totalRevenue - totalCosts;
		const areaHectares = parseFloat(field.areaHectares || '1');
		const profitPerHectare = grossProfit / areaHectares;
		const profitMargin =
			totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

		// Group activities by type
		const byType: Record<string, number> = {};
		activities.forEach((activity) => {
			byType[activity.activityType] =
				(byType[activity.activityType] || 0) + 1;
		});

		// Get weather data
		const weatherData = await this.weatherRepository.find({
			where: { field: { id: fieldId }, isForecast: false },
			order: { recordedAt: 'DESC' },
			take: 100,
		});

		const avgTemperature =
			weatherData.length > 0
				? weatherData.reduce(
						(sum, w) => sum + parseFloat(w.temperatureC || '0'),
						0
					) / weatherData.length
				: 0;

		const totalRainfall = weatherData.reduce(
			(sum, w) => sum + parseFloat(w.rainfallMm || '0'),
			0
		);

		// Count extreme events (simplified)
		const extremeEvents = weatherData.filter(
			(w) =>
				parseFloat(w.temperatureC || '0') > 35 ||
				parseFloat(w.temperatureC || '0') < 10 ||
				parseFloat(w.rainfallMm || '0') > 50
		).length;

		return {
			field: {
				id: field.id,
				name: field.name,
				areaHectares: field.areaHectares || '0',
				soilType: field.soilType,
			},
			currentSeason: currentSeason
				? {
						crop: currentSeason.cropType,
						plantingDate: currentSeason.plantingDate,
						expectedHarvestDate:
							currentSeason.expectedHarvestDate || undefined,
						daysActive: Math.floor(
							(Date.now() -
								new Date(
									currentSeason.plantingDate
								).getTime()) /
								(1000 * 60 * 60 * 24)
						),
						status: currentSeason.actualHarvestDate
							? 'harvested'
							: 'active',
					}
				: undefined,
			financials: {
				totalCosts: Number(totalCosts.toFixed(2)),
				totalRevenue: Number(totalRevenue.toFixed(2)),
				grossProfit: Number(grossProfit.toFixed(2)),
				profitPerHectare: Number(profitPerHectare.toFixed(2)),
				profitMargin: Number(profitMargin.toFixed(2)),
			},
			activities: {
				total: activities.length,
				byType,
			},
			weather: {
				avgTemperature: Number(avgTemperature.toFixed(1)),
				totalRainfall: Number(totalRainfall.toFixed(1)),
				extremeEvents,
				dataPoints: weatherData.length,
			},
			generatedAt: new Date(),
		};
	}

	async generateSeasonalSummary(
		userId: string,
		seasonId: string
	): Promise<SeasonalSummaryReport> {
		// Get season with field
		const season = await this.seasonsRepository.findOne({
			where: { id: seasonId },
			relations: ['field', 'field.plantation', 'field.plantation.owner'],
		});

		if (!season) {
			throw new NotFoundException('Season not found');
		}

		// Verify ownership
		if (season.field.plantation.owner.id !== userId) {
			throw new NotFoundException('Season not found');
		}

		// Get activities for this season
		const activities = await this.activitiesRepository.find({
			where: { plantingSeason: { id: seasonId } },
			order: { activityDate: 'ASC' },
		});

		// Group by type
		const byType: Record<string, number> = {};
		activities.forEach((activity) => {
			byType[activity.activityType] =
				(byType[activity.activityType] || 0) + 1;
		});

		// Get timeline
		const timeline = activities.slice(0, 20).map((a) => ({
			date: a.activityDate,
			type: a.activityType,
			notes: a.notes || undefined,
		}));

		// Calculate input costs from activities
		const inputCosts = activities.reduce(
			(sum, a) => sum + parseFloat(a.inputCostXaf || '0'),
			0
		);

		// Get harvest revenue (filter by description containing 'harvest')
		const allRevenue = await this.financialRepository.find({
			where: {
				field: { id: season.field.id },
				recordType: FinancialRecordType.REVENUE,
			},
		});

		const harvestRecords = allRevenue.filter(
			(r) =>
				r.description?.toLowerCase().includes('harvest') ||
				r.description?.toLowerCase().includes('récolte')
		);

		const harvestRevenue = harvestRecords.reduce(
			(sum, r) => sum + parseFloat(r.amountXaf || '0'),
			0
		);

		const netProfit = harvestRevenue - inputCosts;
		const roi = inputCosts > 0 ? (netProfit / inputCosts) * 100 : 0;

		// Calculate duration
		const plantingDate = new Date(season.plantingDate);
		const endDate = season.actualHarvestDate
			? new Date(season.actualHarvestDate)
			: new Date();
		const durationDays = Math.floor(
			(endDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		// Get yield data if harvested
		let yieldData;
		if (season.actualHarvestDate && season.yieldKg) {
			const areaHectares = parseFloat(season.field.areaHectares || '1');
			const yieldQuantity = parseFloat(season.yieldKg);
			yieldData = {
				quantityKg: yieldQuantity,
				yieldPerHectare: yieldQuantity / areaHectares,
				pricePerKg:
					yieldQuantity > 0 ? harvestRevenue / yieldQuantity : 0,
			};
		}

		return {
			season: {
				id: season.id,
				crop: season.cropType,
				plantingDate: season.plantingDate,
				harvestDate: season.actualHarvestDate || undefined,
				expectedHarvestDate: season.expectedHarvestDate || undefined,
				status: season.actualHarvestDate ? 'harvested' : 'active',
				durationDays,
			},
			field: {
				id: season.field.id,
				name: season.field.name,
				areaHectares: season.field.areaHectares || '0',
			},
			activities: {
				total: activities.length,
				byType,
				timeline,
			},
			financials: {
				inputCosts: Number(inputCosts.toFixed(2)),
				harvestRevenue: Number(harvestRevenue.toFixed(2)),
				netProfit: Number(netProfit.toFixed(2)),
				roi: Number(roi.toFixed(2)),
			},
			yield: yieldData,
			generatedAt: new Date(),
		};
	}

	async generateWeatherImpactReport(
		userId: string,
		fieldId: string,
		startDate: string,
		endDate: string
	): Promise<WeatherImpactReport> {
		// Verify ownership
		const field = await this.fieldAccessService.getOwnedField(
			fieldId,
			userId
		);

		const start = new Date(startDate);
		const end = new Date(endDate);

		// Get weather data for period
		const weatherData = await this.weatherRepository.find({
			where: {
				field: { id: fieldId },
				recordedAt: Between(start, end),
				isForecast: false,
			},
			order: { recordedAt: 'ASC' },
		});

		// Calculate weather summary
		const temperatures = weatherData
			.map((w) => parseFloat(w.temperatureC || '0'))
			.filter((t) => t > 0);
		const rainfall = weatherData.map((w) =>
			parseFloat(w.rainfallMm || '0')
		);
		const humidity = weatherData
			.map((w) => parseFloat(w.humidityPercent || '0'))
			.filter((h) => h > 0);

		const avgTemperature =
			temperatures.length > 0
				? temperatures.reduce((a, b) => a + b, 0) / temperatures.length
				: 0;
		const minTemperature =
			temperatures.length > 0 ? Math.min(...temperatures) : 0;
		const maxTemperature =
			temperatures.length > 0 ? Math.max(...temperatures) : 0;
		const totalRainfall = rainfall.reduce((a, b) => a + b, 0);
		const avgHumidity =
			humidity.length > 0
				? humidity.reduce((a, b) => a + b, 0) / humidity.length
				: 0;

		// Count extreme events
		const heavyRain = weatherData.filter(
			(w) => parseFloat(w.rainfallMm || '0') > 50
		).length;
		const temperatureExtremes = weatherData.filter(
			(w) =>
				parseFloat(w.temperatureC || '0') > 35 ||
				parseFloat(w.temperatureC || '0') < 10
		).length;
		const frostWarnings = weatherData.filter(
			(w) => parseFloat(w.temperatureC || '0') < 2
		).length;

		// Get alerts for period
		const alerts = await this.alertsRepository.find({
			where: {
				field: { id: fieldId },
				triggeredAt: Between(start, end),
			},
		});

		const bySeverity: Record<string, number> = {};
		const byType: Record<string, number> = {};

		alerts.forEach((alert) => {
			bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
			byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
		});

		// Get activities count for correlation
		const activitiesCount = await this.activitiesRepository.count({
			where: {
				field: { id: fieldId },
				activityDate: Between(startDate, endDate),
			},
		});

		return {
			field: {
				id: field.id,
				name: field.name,
			},
			period: {
				startDate,
				endDate,
			},
			weatherSummary: {
				avgTemperature: Number(avgTemperature.toFixed(1)),
				minTemperature: Number(minTemperature.toFixed(1)),
				maxTemperature: Number(maxTemperature.toFixed(1)),
				totalRainfall: Number(totalRainfall.toFixed(1)),
				avgHumidity: Number(avgHumidity.toFixed(1)),
				extremeEvents: {
					heavyRain,
					temperatureExtremes,
					frostWarnings,
				},
			},
			alerts: {
				total: alerts.length,
				bySeverity,
				byType,
			},
			correlations: {
				activitiesCount,
			},
			generatedAt: new Date(),
		};
	}
}
