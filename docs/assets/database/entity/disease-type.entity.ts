// src/entities/disease-type.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('disease_types')
export class DiseaseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  scientificName: string;

  @Column('text', { array: true, nullable: true })
  affectedCrops: string[];

  @Column('jsonb', { nullable: true })
  favorableConditions: any;

  @Column('text', { nullable: true })
  preventionMethods: string;

  @Column('text', { nullable: true })
  treatmentMethods: string;
}