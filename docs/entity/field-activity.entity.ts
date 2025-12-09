// src/entities/field-activity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Field } from './field.entity';
import { PlantingSeason } from './planting-season.entity';
import { ActivityType } from './activity-type.entity';
import { User } from './user.entity';
import { ActivityPhoto } from './activity-photo.entity';

@Entity('field_activities')
export class FieldActivity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Field, field => field.activities, { onDelete: 'CASCADE' })
    field: Field;

    @Column()
    fieldId: string;

    @ManyToOne(() => PlantingSeason, { nullable: true })
    plantingSeason: PlantingSeason;

    @Column({ nullable: true })
    plantingSeasonId: string;

    @ManyToOne(() => ActivityType)
    activityType: ActivityType;

    @Column()
    activityTypeId: string;

    @ManyToOne(() => User, user => user.activities)
    performedBy: User;

    @Column()
    performedById: string;

    @Column('date')
    activityDate: Date;

    @Column('text', { nullable: true })
    description: string;

    // Input tracking
    @Column({ nullable: true })
    inputProduct: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    inputQuantity: number;

    @Column({ nullable: true })
    inputUnit: string;

    // Labor tracking
    @Column('decimal', { precision: 6, scale: 2, nullable: true })
    laborHours: number;

    @Column({ nullable: true })
    workerCount: number;

    // Equipment
    @Column({ nullable: true })
    equipmentUsed: string;

    // Weather at time of activity
    @Column('text', { nullable: true })
    weatherConditions: string;

    // Offline sync support
    @Column({ default: true })
    isSynced: boolean;

    @Column({ nullable: true })
    offlineId: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @OneToMany(() => ActivityPhoto, photo => photo.activity)
    photos: ActivityPhoto[];
}