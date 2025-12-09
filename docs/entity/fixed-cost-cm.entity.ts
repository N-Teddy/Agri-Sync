// src/entities/fixed-cost-cm.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Plantation } from './plantation.entity';

@Entity('fixed_costs_cm')
export class FixedCostCm {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Plantation, { nullable: true, onDelete: 'CASCADE' })
    plantation: Plantation;

    @Column({ nullable: true })
    plantationId: string;

    @Column()
    costType: string; // 'land_rent', 'transport', 'certification', 'maintenance'

    @Column('text', { nullable: true })
    description: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amountXaf: number;

    @Column()
    costFrequency: string; // 'per_hectare_year', 'per_season', 'monthly', 'annual'

    @Column({ type: 'date', nullable: true })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}