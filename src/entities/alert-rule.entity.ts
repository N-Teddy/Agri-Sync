import { Column, Entity, ManyToOne } from 'typeorm';

import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { BaseUuidEntity } from './base-uuid.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'alert_rules' })
export class AlertRule extends BaseUuidEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column('jsonb')
  conditions: Record<string, unknown>;

  @Column({ type: 'enum', enum: AlertSeverity, default: AlertSeverity.Medium })
  severity: AlertSeverity;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Profile, { nullable: true })
  createdBy?: Profile | null;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;
}
