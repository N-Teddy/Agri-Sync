import { Column, Entity, JoinColumn, OneToOne, Unique } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'settings' })
@Unique(['userId'])
export class Setting extends BaseUuidEntity {
  @OneToOne(() => Profile, (profile) => profile.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Profile;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ length: 64, default: 'Africa/Douala' })
  timezone: string;

  @Column({ length: 20, default: 'metric' })
  units: string;

  @Column({ default: true })
  notificationEmailEnabled: boolean;

  @Column({ default: true })
  notificationInAppEnabled: boolean;
}
