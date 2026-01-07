import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { Alert } from './alert.entity';
import { FieldActivity } from './field-activity.entity';
import { Plantation } from './plantation.entity';
import { PlantingSeason } from './planting-season.entity';
import { WeatherData } from './weather-data.entity';

@Entity({ name: 'fields' })
export class Field extends BaseUuidEntity {
  @ManyToOne(() => Plantation, (plantation) => plantation.fields, { onDelete: 'CASCADE' })
  plantation: Plantation;

  @Column({ type: 'uuid' })
  plantationId: string;

  @Column({ length: 255 })
  name: string;

  @Column('geometry', { spatialFeatureType: 'Polygon', srid: 4326 })
  boundary: unknown;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  areaHectares?: number | null;

  @Column({ length: 100, nullable: true })
  soilType?: string | null;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  elevation?: number | null;

  @Column({ length: 100, nullable: true })
  currentCrop?: string | null;

  @OneToMany(() => PlantingSeason, (season) => season.field)
  plantingSeasons: PlantingSeason[];

  @OneToMany(() => WeatherData, (weather) => weather.field)
  weatherData: WeatherData[];

  @OneToMany(() => FieldActivity, (activity) => activity.field)
  activities: FieldActivity[];

  @OneToMany(() => Alert, (alert) => alert.field)
  alerts: Alert[];
}
