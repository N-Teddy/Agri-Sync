import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Field } from './field.entity';

@Entity({ name: 'weather_data' })
@Index(['field', 'recordedAt']) // Composite index for common queries
export class WeatherData extends BaseEntity {
	@ManyToOne(() => Field, (field) => field.weatherReadings, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on field_id
	field!: Field;

	@Column({ type: 'timestamptz' })
	@Index() // Index on recorded_at for date queries
	recordedAt!: Date;

	@Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
	temperatureC?: string;

	@Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
	humidityPercent?: string;

	@Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
	rainfallMm?: string;

	@Column({ type: 'boolean', default: false })
	@Index() // Index on is_forecast for filtering
	isForecast!: boolean;

	@Column({ type: 'varchar', length: 100, nullable: true })
	source?: string;
}
