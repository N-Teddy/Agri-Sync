// src/entities/planting-season.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Field } from './field.entity';
import { CropType } from './crop-type.entity';
import { FieldActivity } from './field-activity.entity';
import { Alert } from './alert.entity';

@Entity('planting_seasons')
export class PlantingSeason {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Field, field => field.plantingSeasons, { onDelete: 'CASCADE' })
    field: Field;

    @Column()
    fieldId: string;

    @ManyToOne(() => CropType)
    cropType: CropType;

    @Column()
    cropTypeId: string;

    @Column('date')
    plantingDate: Date;

    @Column('date', { nullable: true })
    expectedHarvestDate: Date;

    @Column('date', { nullable: true })
    actualHarvestDate: Date;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    initialYieldEstimate: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    actualYield: number;

    @Column({ default: 'active' })
    status: string; // 'planned', 'active', 'harvested', 'failed'

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @OneToMany(() => FieldActivity, activity => activity.plantingSeason)
    activities: FieldActivity[];

    @OneToMany(() => Alert, alert => alert.plantingSeason)
    alerts: Alert[];
}