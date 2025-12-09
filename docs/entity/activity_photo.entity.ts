// src/entities/activity-photo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { FieldActivity } from './field-activity.entity';

@Entity('activity_photos')
export class ActivityPhoto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => FieldActivity, activity => activity.photos, { onDelete: 'CASCADE' })
    activity: FieldActivity;

    @Column()
    activityId: string;

    @Column()
    photoUrl: string;

    @Column({ nullable: true })
    caption: string;

    @CreateDateColumn({ type: 'timestamptz' })
    takenAt: Date;
}