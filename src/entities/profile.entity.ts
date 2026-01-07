import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

import { UserRole } from '../common/enums/user-role.enum';
import { BaseTimestampEntity } from './base-timestamp.entity';
import { AlertNotification } from './alert-notification.entity';
import { Notification } from './notification.entity';
import { Plantation } from './plantation.entity';
import { Setting } from './setting.entity';

@Entity({ name: 'profiles' })
export class Profile extends BaseTimestampEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 50, nullable: true })
  phoneNumber?: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Owner })
  role: UserRole;

  @OneToMany(() => Plantation, (plantation) => plantation.owner)
  plantations: Plantation[];

  @OneToMany(() => AlertNotification, (notification) => notification.user)
  alertNotifications: AlertNotification[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToOne(() => Setting, (setting) => setting.user)
  settings: Setting;
}
