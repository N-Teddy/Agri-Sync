import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FieldActivity } from '../../entities/field-activity.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { FieldAccessService } from '../fields/field-access.service';

@Injectable()
export class ExportService {
	constructor(
		@InjectRepository(FieldActivity)
		private readonly activitiesRepository: Repository<FieldActivity>,
		@InjectRepository(FinancialRecord)
		private readonly financialRepository: Repository<FinancialRecord>,
		@InjectRepository(PlantingSeason)
		private readonly seasonsRepository: Repository<PlantingSeason>,
		private readonly fieldAccessService: FieldAccessService
	) {}

	async exportFinancialRecords(
		userId: string,
		fieldId?: string
	): Promise<string> {
		let records: FinancialRecord[];

		if (fieldId) {
			// Verify ownership and get records for specific field
			await this.fieldAccessService.getOwnedField(fieldId, userId);
			records = await this.financialRepository.find({
				where: { field: { id: fieldId } },
				relations: ['field'],
				order: { recordDate: 'DESC' },
			});
		} else {
			// Get all fields owned by user
			const userFields =
				await this.fieldAccessService.getAllOwnedFields(userId);
			const fieldIds = userFields.map((f) => f.id);

			if (fieldIds.length === 0) {
				return this.generateEmptyCSV([
					'Date',
					'Field',
					'Type',
					'Amount (XAF)',
					'Description',
					'Product',
					'Quantity (kg)',
					'Price per kg (XAF)',
					'Crop Type',
				]);
			}

			records = await this.financialRepository.find({
				where: fieldIds.map((id) => ({ field: { id } })),
				relations: ['field'],
				order: { recordDate: 'DESC' },
			});
		}

		// Generate CSV
		const headers = [
			'Date',
			'Field',
			'Type',
			'Amount (XAF)',
			'Description',
			'Product',
			'Quantity (kg)',
			'Price per kg (XAF)',
			'Crop Type',
		];

		const rows = records.map((record) => [
			record.recordDate,
			record.field.name,
			record.recordType,
			record.amountXaf,
			this.escapeCsvValue(record.description || ''),
			this.escapeCsvValue(record.productName || ''),
			record.quantityKg || '',
			record.pricePerKgXaf || '',
			record.cropType || '',
		]);

		return this.generateCSV(headers, rows);
	}

	async exportActivities(userId: string, fieldId?: string): Promise<string> {
		let activities: FieldActivity[];

		if (fieldId) {
			// Verify ownership and get activities for specific field
			await this.fieldAccessService.getOwnedField(fieldId, userId);
			activities = await this.activitiesRepository.find({
				where: { field: { id: fieldId } },
				relations: ['field', 'plantingSeason'],
				order: { activityDate: 'DESC' },
			});
		} else {
			// Get all fields owned by user
			const userFields =
				await this.fieldAccessService.getAllOwnedFields(userId);
			const fieldIds = userFields.map((f) => f.id);

			if (fieldIds.length === 0) {
				return this.generateEmptyCSV([
					'Date',
					'Field',
					'Activity Type',
					'Season Crop',
					'Notes',
					'Input Product',
					'Input Cost (XAF)',
				]);
			}

			activities = await this.activitiesRepository.find({
				where: fieldIds.map((id) => ({ field: { id } })),
				relations: ['field', 'plantingSeason'],
				order: { activityDate: 'DESC' },
			});
		}

		// Generate CSV
		const headers = [
			'Date',
			'Field',
			'Activity Type',
			'Season Crop',
			'Notes',
			'Input Product',
			'Input Cost (XAF)',
		];

		const rows = activities.map((activity) => [
			activity.activityDate,
			activity.field.name,
			activity.activityType,
			activity.plantingSeason?.cropType || '',
			this.escapeCsvValue(activity.notes || ''),
			this.escapeCsvValue(activity.inputProduct || ''),
			activity.inputCostXaf || '',
		]);

		return this.generateCSV(headers, rows);
	}

	async exportFields(userId: string): Promise<string> {
		const fields = await this.fieldAccessService.getAllOwnedFields(userId);

		if (fields.length === 0) {
			return this.generateEmptyCSV([
				'Name',
				'Area (hectares)',
				'Soil Type',
				'Current Crop',
				'Plantation',
			]);
		}

		// Generate CSV
		const headers = [
			'Name',
			'Area (hectares)',
			'Soil Type',
			'Current Crop',
			'Plantation',
		];

		const rows = fields.map((field) => [
			field.name,
			field.areaHectares || '',
			field.soilType || '',
			field.currentCrop || '',
			field.plantation?.name || '',
		]);

		return this.generateCSV(headers, rows);
	}

	async exportPlantingSeasons(
		userId: string,
		fieldId?: string
	): Promise<string> {
		let seasons: PlantingSeason[];

		if (fieldId) {
			// Verify ownership and get seasons for specific field
			await this.fieldAccessService.getOwnedField(fieldId, userId);
			seasons = await this.seasonsRepository.find({
				where: { field: { id: fieldId } },
				relations: ['field'],
				order: { plantingDate: 'DESC' },
			});
		} else {
			// Get all fields owned by user
			const userFields =
				await this.fieldAccessService.getAllOwnedFields(userId);
			const fieldIds = userFields.map((f) => f.id);

			if (fieldIds.length === 0) {
				return this.generateEmptyCSV([
					'Field',
					'Crop Type',
					'Planting Date',
					'Expected Harvest',
					'Actual Harvest',
					'Yield (kg)',
					'Status',
					'Growth Stage',
				]);
			}

			seasons = await this.seasonsRepository.find({
				where: fieldIds.map((id) => ({ field: { id } })),
				relations: ['field'],
				order: { plantingDate: 'DESC' },
			});
		}

		// Generate CSV
		const headers = [
			'Field',
			'Crop Type',
			'Planting Date',
			'Expected Harvest',
			'Actual Harvest',
			'Yield (kg)',
			'Status',
			'Growth Stage',
		];

		const rows = seasons.map((season) => [
			season.field.name,
			season.cropType,
			season.plantingDate,
			season.expectedHarvestDate || '',
			season.actualHarvestDate || '',
			season.yieldKg || '',
			season.status,
			season.growthStage || '',
		]);

		return this.generateCSV(headers, rows);
	}

	private generateCSV(headers: string[], rows: string[][]): string {
		const csvLines: string[] = [];

		// Add headers
		csvLines.push(headers.join(','));

		// Add rows
		rows.forEach((row) => {
			csvLines.push(row.join(','));
		});

		return csvLines.join('\n');
	}

	private generateEmptyCSV(headers: string[]): string {
		return headers.join(',') + '\n';
	}

	private escapeCsvValue(value: string): string {
		// Escape quotes and wrap in quotes if contains comma, quote, or newline
		if (
			value.includes(',') ||
			value.includes('"') ||
			value.includes('\n')
		) {
			return `"${value.replace(/"/g, '""')}"`;
		}
		return value;
	}
}
