import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { AlertType } from '../common/enums/alert-type.enum';
import { BaseEntity } from './base.entity';
import { Field } from './field.entity';

@Entity({ name: 'alerts' })
@Index(['field', 'triggeredAt']) // Composite index for common queries
export class Alert extends BaseEntity {
	@ManyToOne(() => Field, (field) => field.alerts, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on field_id
	field!: Field;

	@Column({ type: 'varchar', length: 255 })
	title!: string;

	@Column({
		type: 'enum',
		enum: AlertType,
	})
	alertType!: AlertType;

	@Column({
		type: 'enum',
		enum: AlertSeverity,
		default: AlertSeverity.MEDIUM,
	})
	@Index() // Index on severity for filtering
	severity!: AlertSeverity;

	@Column({ type: 'text' })
	message!: string;

	@Column({ type: 'timestamptz' })
	@Index() // Index on triggered_at for sorting
	triggeredAt!: Date;

	@Column({ type: 'timestamptz', nullable: true })
	acknowledgedAt?: Date;

	@Column({ type: 'timestamptz', nullable: true })
	@Index() // Index on resolved_at for filtering unresolved
	resolvedAt?: Date;

	@Column({ type: 'jsonb', nullable: true })
	metadata?: Record<string, unknown>;
}
