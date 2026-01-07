import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { Field } from './field.entity';

@Entity({ name: 'weather_data' })
@Index(['fieldId', 'recordedAt'])
@Index(['fieldId', 'isForecast', 'recordedAt'])
export class WeatherData extends BaseUuidEntity {
  @ManyToOne(() => Field, (field) => field.weatherData, { onDelete: 'CASCADE' })
  field: Field;

  @Column({ type: 'uuid' })
  fieldId: string;

  @Column({ type: 'timestamptz' })
  recordedAt: Date;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  temperature?: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  humidity?: number | null;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  rainfall?: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  windSpeed?: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  windDirection?: number | null;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  solarRadiation?: number | null;

  @Column({ length: 100, nullable: true })
  forecastSource?: string | null;

  @Column({ default: false })
  isForecast: boolean;
}
