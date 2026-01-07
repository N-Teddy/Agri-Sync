import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { ActivityPhoto } from './activity-photo.entity';
import { ActivityType } from './activity-type.entity';
import { Field } from './field.entity';
import { PlantingSeason } from './planting-season.entity';

@Entity({ name: 'field_activities' })
export class FieldActivity extends BaseUuidEntity {
  @ManyToOne(() => Field, (field) => field.activities, { onDelete: 'CASCADE' })
  field: Field;

  @Column({ type: 'uuid' })
  fieldId: string;

  @ManyToOne(() => PlantingSeason, (season) => season.activities, { nullable: true })
  plantingSeason?: PlantingSeason | null;

  @Column({ type: 'uuid', nullable: true })
  plantingSeasonId?: string | null;

  @ManyToOne(() => ActivityType)
  activityType: ActivityType;

  @Column({ type: 'uuid' })
  activityTypeId: string;

  @Column({ type: 'date' })
  activityDate: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 255, nullable: true })
  inputProduct?: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  inputQuantity?: number | null;

  @Column({ length: 50, nullable: true })
  inputUnit?: string | null;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  laborHours?: number | null;

  @Column({ type: 'int', nullable: true })
  workerCount?: number | null;

  @Column({ length: 255, nullable: true })
  equipmentUsed?: string | null;

  @Column({ type: 'text', nullable: true })
  weatherConditions?: string | null;

  @Column({ default: true })
  isSynced: boolean;

  @Column({ length: 255, nullable: true })
  offlineId?: string | null;

  @OneToMany(() => ActivityPhoto, (photo) => photo.activity)
  photos: ActivityPhoto[];
}
