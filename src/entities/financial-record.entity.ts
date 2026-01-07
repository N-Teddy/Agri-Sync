import { Column, Entity, ManyToOne } from 'typeorm';

import { FinancialRecordType } from '../common/enums/financial-record-type.enum';
import { BaseUuidEntity } from './base-uuid.entity';
import { Field } from './field.entity';

@Entity({ name: 'financial_records' })
export class FinancialRecord extends BaseUuidEntity {
  @ManyToOne(() => Field, { onDelete: 'CASCADE' })
  field: Field;

  @Column({ type: 'uuid' })
  fieldId: string;

  @Column({ type: 'enum', enum: FinancialRecordType })
  recordType: FinancialRecordType;

  @Column('decimal', { precision: 12, scale: 2 })
  amountXaf: number;

  @Column({ type: 'date' })
  recordDate: string;

  @Column({ length: 255, nullable: true })
  productName?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 100, nullable: true })
  cropType?: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  quantityKg?: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerKgXaf?: number | null;
}
