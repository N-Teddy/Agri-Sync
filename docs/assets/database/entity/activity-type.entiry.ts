// src/entities/activity-type.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('activity_types')
export class ActivityType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // 'Planting', 'Spraying', 'Irrigation'

    @Column({ nullable: true })
    category: string; // 'cultivation', 'protection', 'harvest'

    @Column({ nullable: true })
    inputType: string; // 'chemical', 'labor', 'water'
}