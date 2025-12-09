// src/entities/weather-data.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Field } from './field.entity';

@Entity('weather_data')
@Index(['fieldId', 'recordedAt'])
@Index(['fieldId', 'isForecast', 'recordedAt'])
export class WeatherData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Field, field => field.weatherData, { onDelete: 'CASCADE' })
    field: Field;

    @Column()
    fieldId: string;

    @Column({ type: 'timestamptz' })
    recordedAt: Date;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    temperature: number; // Celsius

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    humidity: number; // Percentage

    @Column('decimal', { precision: 6, scale: 2, nullable: true })
    rainfall: number; // mm

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    windSpeed: number; // km/h

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    windDirection: number; // degrees

    @Column('decimal', { precision: 8, scale: 2, nullable: true })
    solarRadiation: number; // W/m²

    @Column({ nullable: true })
    forecastSource: string; // 'openweather', 'noaa', 'manual'

    @Column({ default: false })
    isForecast: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}