import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { Field } from '../../entities/field.entity';
import { WeatherService } from './weather.service';

@Injectable()
export class WeatherCronService {
	private readonly logger = new Logger(WeatherCronService.name);

	constructor(
		@InjectRepository(Field)
		private readonly fieldRepository: Repository<Field>,
		private readonly weatherService: WeatherService
	) {}

	/**
	 * Fetch weather data for all active fields every 3 hours
	 * Runs at: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
	 */
	@Cron('0 */3 * * * ', {
		name: 'fetch-weather-data',
		timeZone: 'Africa/Douala', // Cameroon timezone
	})
	async fetchWeatherForAllFields() {
		this.logger.log(
			'Starting scheduled weather data fetch for all fields...'
		);

		try {
			// Get all fields with their plantation owners
			const fields = await this.fieldRepository.find({
				relations: ['plantation', 'plantation.owner'],
				where: {
					boundary: Not(IsNull()), // Only fields with boundaries
				},
			});

			if (fields.length === 0) {
				this.logger.warn(
					'No fields found with boundaries. Skipping weather fetch.'
				);
				return;
			}

			this.logger.log(
				`Found ${fields.length} fields to fetch weather data for`
			);

			let successCount = 0;
			let errorCount = 0;

			// Process fields in batches to avoid overwhelming the API
			const batchSize = 10;
			for (let i = 0; i < fields.length; i += batchSize) {
				const batch = fields.slice(i, i + batchSize);

				await Promise.allSettled(
					batch.map(async (field) => {
						try {
							const ownerId = field.plantation?.owner?.id;
							if (!ownerId) {
								this.logger.warn(
									`Field ${field.id} (${field.name}) has no owner. Skipping.`
								);
								return;
							}

							// Fetch current weather
							await this.weatherService.getCurrentWeather(
								ownerId,
								field.id
							);

							// Fetch 3-day forecast
							await this.weatherService.getForecast(
								ownerId,
								field.id,
								{
									days: 3,
								}
							);

							successCount++;
							this.logger.debug(
								`Successfully fetched weather for field: ${field.name} (${field.id})`
							);
						} catch (error) {
							errorCount++;
							this.logger.error(
								`Failed to fetch weather for field ${field.id} (${field.name}): ${error instanceof Error ? error.message : 'Unknown error'}`,
								error instanceof Error ? error.stack : undefined
							);
						}
					})
				);

				// Add a small delay between batches to respect API rate limits
				if (i + batchSize < fields.length) {
					await this.delay(2000); // 2 second delay between batches
				}
			}

			this.logger.log(
				`Weather fetch completed. Success: ${successCount}, Errors: ${errorCount}`
			);
		} catch (error) {
			this.logger.error(
				`Critical error in weather cron job: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : undefined
			);
		}
	}

	/**
	 * Clean up old weather data (older than 30 days)
	 * Runs daily at 2:00 AM
	 */
	@Cron(CronExpression.EVERY_DAY_AT_2AM, {
		name: 'cleanup-old-weather-data',
		timeZone: 'Africa/Douala',
	})
	async cleanupOldWeatherData() {
		this.logger.log('Starting cleanup of old weather data...');

		try {
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const result = await this.fieldRepository.manager.query(
				`DELETE FROM weather_data WHERE recorded_at < $1`,
				[thirtyDaysAgo]
			);

			this.logger.log(
				`Cleaned up ${result[1] || 0} old weather records (older than 30 days)`
			);
		} catch (error) {
			this.logger.error(
				`Failed to cleanup old weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : undefined
			);
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
