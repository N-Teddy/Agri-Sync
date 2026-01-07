import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { BaseUuidEntity } from './base-uuid.entity';
import { AlertNotification } from './alert-notification.entity';
import { AlertRule } from './alert-rule.entity';
import { Field } from './field.entity';
import { PlantingSeason } from './planting-season.entity';

@Entity({ name: 'alerts' })
export class Alert extends BaseUuidEntity {
  @ManyToOne(() => AlertRule)
  alertRule: AlertRule;

  @Column({ type: 'uuid' })
  alertRuleId: string;

  @ManyToOne(() => Field, (field) => field.alerts, { onDelete: 'CASCADE' })
  field: Field;

  @Column({ type: 'uuid' })
  fieldId: string;

  @ManyToOne(() => PlantingSeason, (season) => season.alerts, { nullable: true })
  plantingSeason?: PlantingSeason | null;

  @Column({ type: 'uuid', nullable: true })
  plantingSeasonId?: string | null;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ length: 100, nullable: true })
  triggeredByMetric?: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  triggerValue?: number | null;

  @Column({ type: 'text', nullable: true })
  expectedImpact?: string | null;

  @Column({ type: 'text', nullable: true })
  recommendedAction?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;

  @OneToMany(() => AlertNotification, (notification) => notification.alert)
  notifications: AlertNotification[];
}
