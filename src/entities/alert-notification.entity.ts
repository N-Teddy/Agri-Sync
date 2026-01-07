import { Column, Entity, ManyToOne } from 'typeorm';

import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { BaseUuidEntity } from './base-uuid.entity';
import { Alert } from './alert.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'alert_notifications' })
export class AlertNotification extends BaseUuidEntity {
  @ManyToOne(() => Alert, (alert) => alert.notifications, { onDelete: 'CASCADE' })
  alert: Alert;

  @Column({ type: 'uuid' })
  alertId: string;

  @ManyToOne(() => Profile, (profile) => profile.alertNotifications, { onDelete: 'CASCADE' })
  user: Profile;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.InApp })
  notificationType: NotificationChannel;

  @Column({ default: false })
  delivered: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;
}
