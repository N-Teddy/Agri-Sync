import { Column, Entity, ManyToOne } from 'typeorm';

import { ActivityType } from '../common/enums/activity-type.enum';
import { BaseEntity } from './base.entity';
import { Field } from './field.entity';
import { PlantingSeason } from './planting-season.entity';

@Entity({ name: 'field_activities' })
export class FieldActivity extends BaseEntity {
  @ManyToOne(() => Field, (field) => field.activities, {
    onDelete: 'CASCADE',
  })
  field!: Field;

  @ManyToOne(() => PlantingSeason, (season) => season.activities, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  plantingSeason?: PlantingSeason;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType!: ActivityType;

  @Column({ type: 'date' })
  activityDate!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  inputProduct?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  inputCostXaf?: string;
}
