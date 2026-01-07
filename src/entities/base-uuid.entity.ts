import { PrimaryGeneratedColumn } from 'typeorm';

import { BaseTimestampEntity } from './base-timestamp.entity';

export abstract class BaseUuidEntity extends BaseTimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
