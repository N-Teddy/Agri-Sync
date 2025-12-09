// src/entities/crop-type.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('crop_types')
export class CropType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // 'Coffee', 'Banana', 'Maize'

  @Column({ nullable: true })
  variety: string; // 'Arabica', 'Cavendish'

  @Column({ nullable: true })
  scientificName: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimalTemperatureMin: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimalTemperatureMax: number;

  @Column({ default: false })
  frostSensitive: boolean;
}