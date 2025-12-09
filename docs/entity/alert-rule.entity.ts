// src/entities/alert-rule.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Alert } from './alert.entity';

@Entity('alert_rules')
export class AlertRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column('jsonb')
    conditions: any;

    @Column({ default: 'medium' })
    severity: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, { nullable: true })
    createdBy: User;

    @Column({ nullable: true })
    createdById: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @OneToMany(() => Alert, alert => alert.alertRule)
    alerts: Alert[];
}