import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { AlertSeverity } from '../../common/enums/alert-severity.enum';
import { AlertType } from '../../common/enums/alert-type.enum';
import { Alert } from '../../entities/alert.entity';
import { Field } from '../../entities/field.entity';
import { NormalizedWeatherReading } from './interfaces/weather-reading.interface';

const ALERT_SUPPRESSION_HOURS = 6;

@Injectable()
export class WeatherAlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>,
  ) { }

  async evaluate(
    field: Field,
    reading: NormalizedWeatherReading,
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];

    if (typeof reading.rainfallMm === 'number' && reading.rainfallMm >= 50) {
      const alert = await this.createAlertIfNecessary({
        field,
        alertType: AlertType.HEAVY_RAIN,
        severity: AlertSeverity.HIGH,
        message: this.buildMessage(
          field,
          'Heavy rainfall expected',
          reading,
          `Forecast indicates ${reading.rainfallMm.toFixed(1)} mm of rain.`,
        ),
        title: 'Heavy Rain Alert',
        reading,
      });
      if (alert) {
        alerts.push(alert);
      }
    }

    if (
      typeof reading.temperatureC === 'number' &&
      (reading.temperatureC <= 10 || reading.temperatureC >= 35)
    ) {
      const alert = await this.createAlertIfNecessary({
        field,
        alertType: AlertType.TEMPERATURE_EXTREME,
        severity:
          reading.temperatureC <= 10 ? AlertSeverity.MEDIUM : AlertSeverity.HIGH,
        message: this.buildMessage(
          field,
          'Temperature extreme detected',
          reading,
          `Temperature projected at ${reading.temperatureC.toFixed(1)}°C.`,
        ),
        title: 'Temperature Extreme',
        reading,
      });
      if (alert) {
        alerts.push(alert);
      }
    }

    if (typeof reading.temperatureC === 'number' && reading.temperatureC <= 2) {
      const alert = await this.createAlertIfNecessary({
        field,
        alertType: AlertType.FROST_WARNING,
        severity: AlertSeverity.HIGH,
        message: this.buildMessage(
          field,
          'Frost risk detected',
          reading,
          `Temperature may drop to ${reading.temperatureC.toFixed(1)}°C.`,
        ),
        title: 'Frost Warning',
        reading,
      });
      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private async createAlertIfNecessary(payload: {
    field: Field;
    alertType: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    reading: NormalizedWeatherReading;
  }): Promise<Alert | undefined> {
    const recentAlert = await this.alertsRepository.findOne({
      where: {
        field: { id: payload.field.id },
        alertType: payload.alertType,
        resolvedAt: IsNull(),
      },
      order: { triggeredAt: 'DESC' },
    });

    if (
      recentAlert &&
      recentAlert.triggeredAt >=
      this.subtractHours(new Date(), ALERT_SUPPRESSION_HOURS)
    ) {
      return undefined;
    }

    const alert = this.alertsRepository.create({
      field: payload.field,
      alertType: payload.alertType,
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      triggeredAt: new Date(),
      metadata: {
        recordedAt: payload.reading.recordedAt.toISOString(),
        temperatureC: payload.reading.temperatureC,
        humidityPercent: payload.reading.humidityPercent,
        rainfallMm: payload.reading.rainfallMm,
        isForecast: payload.reading.isForecast,
        source: payload.reading.source,
      },
    });

    return this.alertsRepository.save(alert);
  }

  private subtractHours(date: Date, hours: number) {
    return new Date(date.getTime() - hours * 60 * 60 * 1000);
  }

  private buildMessage(
    field: Field,
    headline: string,
    reading: NormalizedWeatherReading,
    detail: string,
  ) {
    const context = reading.isForecast ? 'Forecast' : 'Observed';
    return `${headline} for ${field.name}. ${context} data at ${reading.recordedAt.toISOString()}. ${detail}`;
  }
}
