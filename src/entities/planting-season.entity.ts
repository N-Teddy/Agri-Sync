import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { CropType } from '../common/enums/crop-type.enum';
import { PlantingSeasonStatus } from '../common/enums/planting-season-status.enum';
import { BaseEntity } from './base.entity';
import { Field } from './field.entity';
import { FieldActivity } from './field-activity.entity';

@Entity({ name: 'planting_seasons' })
export class PlantingSeason extends BaseEntity {
	@ManyToOne(() => Field, (field) => field.plantingSeasons, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on field_id
	field!: Field;

	@Column({
		type: 'enum',
		enum: CropType,
	})
	cropType!: CropType;

	@Column({ type: 'date' })
	@Index() // Index on planting_date
	plantingDate!: string;

	@Column({ type: 'date', nullable: true })
	expectedHarvestDate?: string;

	@Column({ type: 'date', nullable: true })
	actualHarvestDate?: string;

	@Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
	yieldKg?: string;

	@Column({
		type: 'enum',
		enum: PlantingSeasonStatus,
		default: PlantingSeasonStatus.ACTIVE,
	})
	@Index() // Index on status
	status!: PlantingSeasonStatus;

	@Column({ type: 'varchar', length: 100, nullable: true })
	growthStage?: string;

	@OneToMany(() => FieldActivity, (activity) => activity.plantingSeason)
	activities?: FieldActivity[];
}
