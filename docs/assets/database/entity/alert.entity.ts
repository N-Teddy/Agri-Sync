// src/entities/alert.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { AlertRule } from './alert-rule.entity';
import { Field } from './field.entity';
import { PlantingSeason } from './planting-season.entity';
import { User } from './user.entity';
import { AlertNotification } from './alert-notification.entity';

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => AlertRule)
    alertRule: AlertRule;

    @Column()
    alertRuleId: string;

    @ManyToOne(() => Field, field => field.alerts, { onDelete: 'CASCADE' })
    field: Field;

    @Column()
    fieldId: string;

    @ManyToOne(() => PlantingSeason, { nullable: true })
    plantingSeason: PlantingSeason;

    @Column({ nullable: true })
    plantingSeasonId: string;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column()
    severity: string;

    // Trigger information
    @Column({ nullable: true })
    triggeredByMetric: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    triggerValue: number;

    @Column('text', { nullable: true })
    expectedImpact: string;

    @Column('text', { nullable: true })
    recommendedAction: string;

    // Alert lifecycle
    @CreateDateColumn({ type: 'timestamptz' })
    triggeredAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    acknowledgedAt: Date;

    @ManyToOne(() => User, { nullable: true })
    acknowledgedBy: User;

    @Column({ nullable: true })
    acknowledgedById: string;

    @Column({ type: 'timestamptz', nullable: true })
    resolvedAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @OneToMany(() => AlertNotification, notification => notification.alert)
    notifications: AlertNotification[];
}