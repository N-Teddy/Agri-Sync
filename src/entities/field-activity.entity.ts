import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { ActivityType } from '../common/enums/activity-type.enum';
import { ActivityPhoto } from './activity-photo.entity';
import { BaseEntity } from './base.entity';
import { Field } from './field.entity';
import { PlantingSeason } from './planting-season.entity';

@Entity({ name: 'field_activities' })
@Index(['field', 'activityDate']) // Composite index
export class FieldActivity extends BaseEntity {
	@ManyToOne(() => Field, (field) => field.activities, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on field_id
	field!: Field;

	@ManyToOne(() => PlantingSeason, (season) => season.activities, {
		onDelete: 'SET NULL',
		nullable: true,
	})
	@Index() // Index on planting_season_id
	plantingSeason?: PlantingSeason;

	@Column({
		type: 'enum',
		enum: ActivityType,
	})
	activityType!: ActivityType;

	@Column({ type: 'date' })
	@Index() // Index on activity_date
	activityDate!: string;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	inputProduct?: string;

	@Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
	inputCostXaf?: string;

	@OneToMany(() => ActivityPhoto, (photo) => photo.activity)
	photos?: ActivityPhoto[];
}
