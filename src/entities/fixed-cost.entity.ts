import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { Plantation } from './plantation.entity';

@Entity({ name: 'fixed_costs_cm' })
export class FixedCost extends BaseUuidEntity {
  @ManyToOne(() => Plantation, { nullable: true, onDelete: 'CASCADE' })
  plantation?: Plantation | null;

  @Column({ type: 'uuid', nullable: true })
  plantationId?: string | null;

  @Column({ length: 100 })
  costType: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column('decimal', { precision: 12, scale: 2 })
  amountXaf: number;

  @Column({ length: 20 })
  costFrequency: string;

  @Column({ type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ default: true })
  isActive: boolean;
}
