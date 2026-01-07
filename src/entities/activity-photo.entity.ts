import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { FieldActivity } from './field-activity.entity';

@Entity({ name: 'activity_photos' })
export class ActivityPhoto extends BaseUuidEntity {
  @ManyToOne(() => FieldActivity, (activity) => activity.photos, { onDelete: 'CASCADE' })
  activity: FieldActivity;

  @Column({ type: 'uuid' })
  activityId: string;

  @Column({ length: 500 })
  photoUrl: string;

  @Column({ length: 255, nullable: true })
  caption?: string | null;

  @Column('int', { nullable: true })
  width?: number | null;

  @Column('int', { nullable: true })
  height?: number | null;

  @Column('int', { nullable: true })
  fileSize?: number | null;
}
