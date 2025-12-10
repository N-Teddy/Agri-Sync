import { Column, Entity, ManyToOne } from 'typeorm';

import { CropType } from '../common/enums/crop-type.enum';
import { FinancialRecordType } from '../common/enums/financial-record-type.enum';
import { BaseEntity } from './base.entity';
import { Field } from './field.entity';

@Entity({ name: 'financial_records' })
export class FinancialRecord extends BaseEntity {
  @ManyToOne(() => Field, (field) => field.financialRecords, {
    onDelete: 'CASCADE',
  })
  field!: Field;

  @Column({
    type: 'enum',
    enum: FinancialRecordType,
  })
  recordType!: FinancialRecordType;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amountXaf!: string;

  @Column({ type: 'date' })
  recordDate!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productName?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  quantityKg?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  pricePerKgXaf?: string;

  @Column({
    type: 'enum',
    enum: CropType,
    nullable: true,
  })
  cropType?: CropType;
}
