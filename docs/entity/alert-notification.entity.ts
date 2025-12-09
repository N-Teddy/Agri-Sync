// src/entities/alert-notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Alert } from './alert.entity';
import { User } from './user.entity';

@Entity('alert_notifications')
export class AlertNotification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Alert, alert => alert.notifications, { onDelete: 'CASCADE' })
    alert: Alert;

    @Column()
    alertId: string;

    @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;

    @Column({ default: 'push' })
    notificationType: string;

    @CreateDateColumn({ type: 'timestamptz' })
    sentAt: Date;

    @Column({ default: false })
    delivered: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    readAt: Date;
}