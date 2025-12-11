import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const dateColumnType = process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: dateColumnType })
  createdAt!: Date;

  @UpdateDateColumn({ type: dateColumnType })
  updatedAt!: Date;
}
