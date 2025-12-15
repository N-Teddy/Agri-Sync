import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { Alert } from '../../entities/alert.entity';
import { FieldAccessService } from '../fields/field-access.service';
import { GetAlertsQueryDto } from './dto/get-alerts-query.dto';

@Injectable()
export class AlertsService {
	private readonly logger = new Logger(AlertsService.name);

	constructor(
		@InjectRepository(Alert)
		private readonly alertsRepository: Repository<Alert>,
		private readonly fieldAccessService: FieldAccessService
	) {}

	async getAlerts(
		userId: string,
		query: GetAlertsQueryDto
	): Promise<Alert[]> {
		const whereConditions: any = {};

		// If fieldId is provided, verify user owns the field
		if (query.fieldId) {
			await this.fieldAccessService.getOwnedField(query.fieldId, userId);
			whereConditions.field = { id: query.fieldId };
		} else {
			// Get all fields owned by user
			const userFields =
				await this.fieldAccessService.getAllOwnedFields(userId);
			const fieldIds = userFields.map((f) => f.id);

			if (fieldIds.length === 0) {
				return [];
			}

			whereConditions.field = { id: In(fieldIds) };
		}

		// Apply other filters
		if (query.alertType) {
			whereConditions.alertType = query.alertType;
		}

		if (query.severity) {
			whereConditions.severity = query.severity;
		}

		if (query.unacknowledgedOnly) {
			whereConditions.acknowledgedAt = IsNull();
		}

		if (query.unresolvedOnly) {
			whereConditions.resolvedAt = IsNull();
		}

		const alerts = await this.alertsRepository.find({
			where: whereConditions,
			relations: ['field', 'field.plantation'],
			order: { triggeredAt: 'DESC' },
		});

		return alerts;
	}

	async getAlertById(userId: string, alertId: string): Promise<Alert> {
		const alert = await this.alertsRepository.findOne({
			where: { id: alertId },
			relations: ['field', 'field.plantation'],
		});

		if (!alert) {
			throw new NotFoundException(`Alert with ID ${alertId} not found`);
		}

		// Verify user owns the field
		await this.fieldAccessService.getOwnedField(alert.field.id, userId);

		return alert;
	}

	async acknowledgeAlert(userId: string, alertId: string): Promise<Alert> {
		const alert = await this.getAlertById(userId, alertId);

		if (alert.acknowledgedAt) {
			this.logger.warn(
				`Alert ${alertId} was already acknowledged at ${alert.acknowledgedAt.toISOString()}`
			);
			return alert;
		}

		alert.acknowledgedAt = new Date();
		const updated = await this.alertsRepository.save(alert);

		this.logger.log(`Alert ${alertId} acknowledged by user ${userId}`);
		return updated;
	}

	async resolveAlert(userId: string, alertId: string): Promise<Alert> {
		const alert = await this.getAlertById(userId, alertId);

		if (alert.resolvedAt) {
			this.logger.warn(
				`Alert ${alertId} was already resolved at ${alert.resolvedAt.toISOString()}`
			);
			return alert;
		}

		alert.resolvedAt = new Date();

		// Auto-acknowledge if not already acknowledged
		if (!alert.acknowledgedAt) {
			alert.acknowledgedAt = new Date();
		}

		const updated = await this.alertsRepository.save(alert);

		this.logger.log(`Alert ${alertId} resolved by user ${userId}`);
		return updated;
	}

	async deleteAlert(userId: string, alertId: string): Promise<void> {
		const alert = await this.getAlertById(userId, alertId);
		await this.alertsRepository.remove(alert);
		this.logger.log(`Alert ${alertId} deleted by user ${userId}`);
	}

	async getUnacknowledgedCount(userId: string): Promise<number> {
		const userFields =
			await this.fieldAccessService.getAllOwnedFields(userId);
		const fieldIds = userFields.map((f) => f.id);

		if (fieldIds.length === 0) {
			return 0;
		}

		const count = await this.alertsRepository.count({
			where: {
				field: { id: In(fieldIds) },
				acknowledgedAt: IsNull(),
			},
		});

		return count;
	}
}
