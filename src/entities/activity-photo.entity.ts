import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { FieldActivity } from './field-activity.entity';

@Entity({ name: 'activity_photos' })
export class ActivityPhoto extends BaseEntity {
	@ManyToOne(() => FieldActivity, (activity) => activity.photos, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on activity_id
	activity!: FieldActivity;

	@Column({ type: 'varchar', length: 500 })
	photoUrl!: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	publicId?: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	caption?: string;

	@Column({ type: 'integer', nullable: true })
	width?: number;

	@Column({ type: 'integer', nullable: true })
	height?: number;

	@Column({ type: 'integer', nullable: true })
	fileSize?: number;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	@Index() // Index on taken_at
	takenAt!: Date;
}
