import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Field } from './field.entity';
import { AlertType } from '../common/enums/alert-type.enum';
import { AlertSeverity } from '../common/enums/alert-severity.enum';

@Entity({ name: 'alerts' })
export class Alert extends BaseEntity {
  @ManyToOne(() => Field, (field) => field.alerts, {
    onDelete: 'CASCADE',
  })
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
  severity!: AlertSeverity;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'timestamptz' })
  triggeredAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
