import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'notifications' })
export class Notification extends BaseUuidEntity {
  @ManyToOne(() => Profile, (profile) => profile.notifications, { onDelete: 'CASCADE' })
  user: Profile;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ length: 100 })
  type: string;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId?: string | null;

  @Column({ default: false })
  isRead: boolean;
}
