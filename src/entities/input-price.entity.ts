import { Column, Entity } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';

@Entity({ name: 'input_prices_cm' })
export class InputPrice extends BaseUuidEntity {
  @Column({ length: 255 })
  productName: string;

  @Column({ length: 100 })
  productType: string;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPriceXaf: number;

  @Column({ length: 50 })
  unitType: string;

  @Column({ length: 255, nullable: true })
  supplier?: string | null;

  @Column({ length: 100, nullable: true })
  region?: string | null;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  lastUpdated: string;

  @Column({ default: true })
  isActive: boolean;
}
