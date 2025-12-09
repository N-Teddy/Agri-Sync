// src/entities/market-price-cm.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('market_prices_cm')
export class MarketPriceCm {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    cropType: string;

    @Column({ default: 'standard' })
    qualityGrade: string; // 'premium', 'standard', 'commercial'

    @Column('decimal', { precision: 8, scale: 2 })
    pricePerUnitXaf: number;

    @Column({ default: 'kg' })
    unitType: string; // 'kg', 'bunch', 'bag'

    @Column()
    marketLocation: string; // 'Douala', 'Yaoundé', 'Bamenda', 'Bafoussam'

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    recordDate: Date;

    @Column({ nullable: true })
    source: string; // 'government', 'market', 'contract'

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}