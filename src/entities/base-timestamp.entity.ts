import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseTimestampEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
