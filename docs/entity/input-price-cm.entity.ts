// src/entities/input-price-cm.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('input_prices_cm')
export class InputPriceCm {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productName: string;

    @Column()
    productType: string; // 'fertilizer', 'pesticide', 'seed', 'herbicide'

    @Column('decimal', { precision: 10, scale: 2 })
    unitPriceXaf: number;

    @Column()
    unitType: string; // 'kg', 'liter', 'bag', 'plant'

    @Column({ nullable: true })
    supplier: string;

    @Column({ nullable: true })
    region: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    lastUpdated: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}