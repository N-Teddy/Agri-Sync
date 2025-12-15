import {
	Column,
	ColumnOptions,
	Entity,
	Index,
	ManyToOne,
	OneToMany,
} from 'typeorm';

import { CropType } from '../common/enums/crop-type.enum';
import { Alert } from './alert.entity';
import { BaseEntity } from './base.entity';
import { FieldActivity } from './field-activity.entity';
import { FinancialRecord } from './financial-record.entity';
import { Plantation } from './plantation.entity';
import { PlantingSeason } from './planting-season.entity';
import { WeatherData } from './weather-data.entity';

const isTestEnv = process.env.NODE_ENV === 'test';

const boundaryColumnOptions: ColumnOptions = isTestEnv
	? {
			type: 'simple-json',
			nullable: true,
		}
	: {
			type: 'geometry',
			spatialFeatureType: 'Polygon',
			srid: 4326,
			nullable: true,
		};

@Entity({ name: 'fields' })
export class Field extends BaseEntity {
	@Column({ type: 'varchar', length: 255 })
	name!: string;

	@Column(boundaryColumnOptions)
	boundary?: Record<string, unknown>;

	@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
	areaHectares?: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	soilType?: string;

	@Column({
		type: 'enum',
		enum: CropType,
		nullable: true,
	})
	currentCrop?: CropType | null;

	@ManyToOne(() => Plantation, (plantation) => plantation.fields, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on plantation_id
	plantation!: Plantation;

	@OneToMany(() => PlantingSeason, (season) => season.field)
	plantingSeasons?: PlantingSeason[];

	@OneToMany(() => FieldActivity, (activity) => activity.field)
	activities?: FieldActivity[];

	@OneToMany(() => WeatherData, (weather) => weather.field)
	weatherReadings?: WeatherData[];

	@OneToMany(() => FinancialRecord, (record) => record.field)
	financialRecords?: FinancialRecord[];

	@OneToMany(() => Alert, (alert) => alert.field)
	alerts?: Alert[];
}
