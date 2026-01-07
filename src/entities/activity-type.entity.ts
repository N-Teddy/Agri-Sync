import { Column, Entity } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';

@Entity({ name: 'activity_types' })
export class ActivityType extends BaseUuidEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  category?: string | null;

  @Column({ length: 100, nullable: true })
  inputType?: string | null;
}
