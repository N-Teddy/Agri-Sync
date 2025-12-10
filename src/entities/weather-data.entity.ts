import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Field } from './field.entity';

@Entity({ name: 'weather_data' })
export class WeatherData extends BaseEntity {
  @ManyToOne(() => Field, (field) => field.weatherReadings, {
    onDelete: 'CASCADE',
  })
  field!: Field;

  @Column({ type: 'timestamptz' })
  recordedAt!: Date;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  temperatureC?: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  humidityPercent?: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  rainfallMm?: string;

  @Column({ type: 'boolean', default: false })
  isForecast!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source?: string;
}
