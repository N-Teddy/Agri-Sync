// src/entities/field.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Plantation } from './plantation.entity';
import { PlantingSeason } from './planting-season.entity';
import { WeatherData } from './weather-data.entity';
import { FieldActivity } from './field-activity.entity';
import { Alert } from './alert.entity';

@Entity('fields')
export class Field {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Plantation, plantation => plantation.fields, { onDelete: 'CASCADE' })
    plantation: Plantation;

    @Column()
    plantationId: string;

    @Column()
    name: string;

    @Column('geometry', { spatialFeatureType: 'Polygon', srid: 4326 })
    boundary: any; // GeoJSON Polygon

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    areaHectares: number;

    @Column({ nullable: true })
    soilType: string;

    @Column('decimal', { precision: 8, scale: 2, nullable: true })
    elevation: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @OneToMany(() => PlantingSeason, season => season.field)
    plantingSeasons: PlantingSeason[];

    @OneToMany(() => WeatherData, weather => weather.field)
    weatherData: WeatherData[];

    @OneToMany(() => FieldActivity, activity => activity.field)
    activities: FieldActivity[];

    @OneToMany(() => Alert, alert => alert.field)
    alerts: Alert[];
}