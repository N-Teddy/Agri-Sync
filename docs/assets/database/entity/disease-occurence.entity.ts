// src/entities/disease-occurrence.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Field } from './field.entity';
import { DiseaseType } from './disease-type.entity';
import { PlantingSeason } from './planting-season.entity';

@Entity('disease_occurrences')
export class DiseaseOccurrence {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Field, field => field.id, { onDelete: 'CASCADE' })
    field: Field;

    @Column()
    fieldId: string;

    @ManyToOne(() => DiseaseType)
    diseaseType: DiseaseType;

    @Column()
    diseaseTypeId: string;

    @ManyToOne(() => PlantingSeason, { nullable: true })
    plantingSeason: PlantingSeason;

    @Column({ nullable: true })
    plantingSeasonId: string;

    @Column('date')
    firstObserved: Date;

    @Column({ nullable: true })
    severity: string;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    affectedAreaPercent: number;

    @Column('jsonb', { nullable: true })
    weatherConditions: any;

    @Column('text', { nullable: true })
    treatmentApplied: string;

    @Column({ nullable: true })
    treatmentEffectiveness: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}