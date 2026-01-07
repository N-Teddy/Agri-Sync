import { Column, Entity } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';

@Entity({ name: 'crop_types' })
export class CropType extends BaseUuidEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  variety?: string | null;

  @Column({ length: 255, nullable: true })
  scientificName?: string | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimalTemperatureMin?: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimalTemperatureMax?: number | null;

  @Column({ default: false })
  frostSensitive: boolean;
}
