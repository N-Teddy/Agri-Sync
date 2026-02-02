import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import type { AppConfiguration } from '../../config/configuration';
import { Field } from '../../entities/field.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import { FieldAccessService } from '../fields/field-access.service';
import { FieldBoundary } from '../plantations/types/field-boundary.type';
import { calculateFieldCentroid } from '../plantations/utils/field-geometry.util';
import { WeatherForecastQueryDto } from './dto/weather-forecast-query.dto';
import { NormalizedWeatherReading } from './interfaces/weather-reading.interface';
import { WeatherAlertsService } from './weather-alerts.service';

export interface WeatherObservation {
	recordedAt: string;
	temperatureC?: number;
	humidityPercent?: number;
	rainfallMm?: number;
	source: string;
	isForecast: boolean;
}

interface OpenWeatherCurrentResponse {
	dt?: number;
	main?: {
		temp?: number;
		humidity?: number;
	};
	rain?: {
		'1h'?: number;
		'3h'?: number;
	};
}

interface OpenWeatherForecastEntry {
	dt?: number;
	main?: {
		temp?: number;
		humidity?: number;
	};
	rain?: {
		'3h'?: number;
	};
}

interface OpenWeatherForecastResponse {
	list?: OpenWeatherForecastEntry[];
}

@Injectable()
export class WeatherService {
	private readonly logger = new Logger(WeatherService.name);
	private readonly weatherConfig: AppConfiguration['weather'];

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService<AppConfiguration>,
		@InjectRepository(WeatherData)
		private readonly weatherRepository: Repository<WeatherData>,
		private readonly fieldAccessService: FieldAccessService,
		private readonly weatherAlertsService: WeatherAlertsService
	) {
		const weatherConfig =
			this.configService.get<AppConfiguration['weather']>('weather');
		if (!weatherConfig?.apiKey) {
			throw new Error('Weather configuration is missing an API key');
		}
		this.weatherConfig = weatherConfig;
	}

	async getCurrentWeather(
		ownerId: string,
		fieldId: string
	): Promise<WeatherObservation> {
		const field = await this.fieldAccessService.getOwnedField(
			fieldId,
			ownerId
		);
		const { lat, lng } = this.extractCoordinates(field);
		try {
			const apiData = await this.fetchCurrentFromProvider(lat, lng);
			const normalized = this.normalizeCurrentWeather(apiData);
			const observation = await this.persistReading(field, normalized);
			await this.weatherAlertsService.evaluate(field, normalized);

			return observation;
		} catch (error) {
			const cached = await this.getLatestObservation(field);
			if (cached) {
				return cached;
			}
			return this.buildUnavailableObservation(false);
		}
	}

	async getForecast(
		ownerId: string,
		fieldId: string,
		query: WeatherForecastQueryDto
	): Promise<WeatherObservation[]> {
		const field = await this.fieldAccessService.getOwnedField(
			fieldId,
			ownerId
		);
		const { lat, lng } = this.extractCoordinates(field);
		const forecastDays =
			query.days ?? this.weatherConfig.defaultForecastDays;
		try {
			const apiData = await this.fetchForecastFromProvider(lat, lng);
			const normalizedForecast = this.normalizeForecast(
				apiData,
				forecastDays
			);

			const saved = await Promise.all(
				normalizedForecast.map((reading) =>
					this.persistReading(field, reading)
				)
			);
			await Promise.all(
				normalizedForecast.map((reading) =>
					this.weatherAlertsService.evaluate(field, reading)
				)
			);
			return saved;
		} catch (error) {
			const cached = await this.getCachedForecast(field, forecastDays);
			return cached;
		}
	}

	private async fetchCurrentFromProvider(
		lat: number,
		lng: number
	): Promise<OpenWeatherCurrentResponse> {
		try {
			const response = await firstValueFrom(
				this.httpService.get(`${this.weatherConfig.baseUrl}/weather`, {
					params: {
						lat,
						lon: lng,
						units: 'metric',
						appid: this.weatherConfig.apiKey,
					},
				})
			);
			return response.data as OpenWeatherCurrentResponse;
		} catch (error) {
			this.handleProviderError(error, 'current');
			throw error;
		}
	}

	private async fetchForecastFromProvider(
		lat: number,
		lng: number
	): Promise<OpenWeatherForecastResponse> {
		try {
			const response = await firstValueFrom(
				this.httpService.get(`${this.weatherConfig.baseUrl}/forecast`, {
					params: {
						lat,
						lon: lng,
						units: 'metric',
						appid: this.weatherConfig.apiKey,
					},
				})
			);
			return response.data as OpenWeatherForecastResponse;
		} catch (error) {
			this.handleProviderError(error, 'forecast');
			throw error;
		}
	}

	private normalizeCurrentWeather(
		data: OpenWeatherCurrentResponse
	): NormalizedWeatherReading {
		return {
			recordedAt: data.dt ? new Date(data.dt * 1000) : new Date(),
			temperatureC: data.main?.temp,
			humidityPercent: data.main?.humidity,
			rainfallMm: data.rain?.['1h'] ?? data.rain?.['3h'],
			isForecast: false,
			source: 'openweather',
		};
	}

	private normalizeForecast(
		data: OpenWeatherForecastResponse,
		days: number
	): NormalizedWeatherReading[] {
		const list = Array.isArray(data.list) ? data.list : [];
		const grouped = new Map<
			string,
			{
				temps: number[];
				humidities: number[];
				rainfallTotals: number;
				timestamp: number;
			}
		>();

		for (const entry of list) {
			const timestamp =
				typeof entry.dt === 'number' ? entry.dt * 1000 : Date.now();
			const dateKey = new Date(timestamp).toISOString().split('T')[0];

			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, {
					temps: [],
					humidities: [],
					rainfallTotals: 0,
					timestamp,
				});
			}

			const bucket = grouped.get(dateKey)!;
			if (typeof entry.main?.temp === 'number') {
				bucket.temps.push(entry.main.temp);
			}
			if (typeof entry.main?.humidity === 'number') {
				bucket.humidities.push(entry.main.humidity);
			}
			if (entry.rain?.['3h']) {
				bucket.rainfallTotals += entry.rain['3h'];
			}
			bucket.timestamp = timestamp;
		}

		const normalized: NormalizedWeatherReading[] = [];
		const sortedKeys = Array.from(grouped.keys()).sort();

		for (const key of sortedKeys.slice(0, days)) {
			const bucket = grouped.get(key)!;
			normalized.push({
				recordedAt: new Date(bucket.timestamp),
				temperatureC: bucket.temps.length
					? bucket.temps.reduce((a, b) => a + b, 0) /
						bucket.temps.length
					: undefined,
				humidityPercent: bucket.humidities.length
					? bucket.humidities.reduce((a, b) => a + b, 0) /
						bucket.humidities.length
					: undefined,
				rainfallMm: bucket.rainfallTotals || 0,
				isForecast: true,
				source: 'openweather',
			});
		}

		return normalized;
	}

	private async persistReading(
		field: Field,
		reading: NormalizedWeatherReading
	): Promise<WeatherObservation> {
		const entity = this.weatherRepository.create({
			field,
			recordedAt: reading.recordedAt,
			temperatureC:
				typeof reading.temperatureC === 'number'
					? reading.temperatureC.toFixed(2)
					: undefined,
			humidityPercent:
				typeof reading.humidityPercent === 'number'
					? reading.humidityPercent.toFixed(2)
					: undefined,
			rainfallMm:
				typeof reading.rainfallMm === 'number'
					? reading.rainfallMm.toFixed(2)
					: undefined,
			isForecast: reading.isForecast,
			source: reading.source,
		});

		const saved = await this.weatherRepository.save(entity);
		return {
			recordedAt: saved.recordedAt.toISOString(),
			temperatureC: saved.temperatureC
				? Number(saved.temperatureC)
				: undefined,
			humidityPercent: saved.humidityPercent
				? Number(saved.humidityPercent)
				: undefined,
			rainfallMm: saved.rainfallMm ? Number(saved.rainfallMm) : undefined,
			source: saved.source ?? 'openweather',
			isForecast: saved.isForecast,
		};
	}

	private async getLatestObservation(
		field: Field
	): Promise<WeatherObservation | null> {
		const actual = await this.weatherRepository.findOne({
			where: { field: { id: field.id }, isForecast: false },
			order: { recordedAt: 'DESC' },
		});
		if (actual) {
			return this.toObservation(actual);
		}
		const fallback = await this.weatherRepository.findOne({
			where: { field: { id: field.id } },
			order: { recordedAt: 'DESC' },
		});
		return fallback ? this.toObservation(fallback) : null;
	}

	private async getCachedForecast(
		field: Field,
		days: number
	): Promise<WeatherObservation[]> {
		const readings = await this.weatherRepository.find({
			where: { field: { id: field.id }, isForecast: true },
			order: { recordedAt: 'DESC' },
			take: Math.max(1, days),
		});
		if (!readings.length) {
			return [];
		}
		return readings.reverse().map((reading) => this.toObservation(reading));
	}

	private toObservation(reading: WeatherData): WeatherObservation {
		return {
			recordedAt: reading.recordedAt.toISOString(),
			temperatureC: reading.temperatureC
				? Number(reading.temperatureC)
				: undefined,
			humidityPercent: reading.humidityPercent
				? Number(reading.humidityPercent)
				: undefined,
			rainfallMm: reading.rainfallMm
				? Number(reading.rainfallMm)
				: undefined,
			source: reading.source ?? 'openweather',
			isForecast: reading.isForecast,
		};
	}

	private buildUnavailableObservation(
		isForecast: boolean
	): WeatherObservation {
		return {
			recordedAt: '',
			temperatureC: undefined,
			humidityPercent: undefined,
			rainfallMm: undefined,
			source: 'unavailable',
			isForecast,
		};
	}

	private extractCoordinates(field: Field): { lat: number; lng: number } {
		const boundary = field.boundary as FieldBoundary | undefined;
		if (!boundary || !Array.isArray(boundary.coordinates)) {
			throw new BadRequestException(
				'Field boundary is required to determine weather location'
			);
		}
		const centroid = calculateFieldCentroid(boundary);
		if (
			typeof centroid.lat !== 'number' ||
			typeof centroid.lng !== 'number' ||
			Number.isNaN(centroid.lat) ||
			Number.isNaN(centroid.lng)
		) {
			throw new BadRequestException(
				'Field boundary does not contain valid coordinates'
			);
		}
		return centroid;
	}

	private handleProviderError(error: unknown, context: string) {
		if ((error as AxiosError).isAxiosError) {
			const axiosError = error as AxiosError;
			this.logger.error(
				`Failed to fetch ${context} weather: ${axiosError.message}`,
				axiosError.stack
			);
		} else {
			this.logger.error(
				`Failed to fetch ${context} weather`,
				(error as Error).stack
			);
		}
	}
}
