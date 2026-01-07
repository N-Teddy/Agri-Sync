import { Column, Entity } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';

@Entity({ name: 'market_prices_cm' })
export class MarketPrice extends BaseUuidEntity {
  @Column({ length: 100 })
  cropType: string;

  @Column({ length: 50, default: 'standard' })
  qualityGrade: string;

  @Column('decimal', { precision: 8, scale: 2 })
  pricePerUnitXaf: number;

  @Column({ length: 50, default: 'kg' })
  unitType: string;

  @Column({ length: 100 })
  marketLocation: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  recordDate: string;

  @Column({ length: 100, nullable: true })
  source?: string | null;
}
