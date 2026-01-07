import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { PlantingSeasonStatus } from '../common/enums/planting-season-status.enum';
import { BaseUuidEntity } from './base-uuid.entity';
import { Alert } from './alert.entity';
import { CropType } from './crop-type.entity';
import { Field } from './field.entity';
import { FieldActivity } from './field-activity.entity';

@Entity({ name: 'planting_seasons' })
export class PlantingSeason extends BaseUuidEntity {
  @ManyToOne(() => Field, (field) => field.plantingSeasons, { onDelete: 'CASCADE' })
  field: Field;

  @Column({ type: 'uuid' })
  fieldId: string;

  @ManyToOne(() => CropType)
  cropType: CropType;

  @Column({ type: 'uuid' })
  cropTypeId: string;

  @Column({ type: 'date' })
  plantingDate: string;

  @Column({ type: 'date', nullable: true })
  expectedHarvestDate?: string | null;

  @Column({ type: 'date', nullable: true })
  actualHarvestDate?: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  initialYieldEstimate?: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualYield?: number | null;

  @Column({ type: 'enum', enum: PlantingSeasonStatus, default: PlantingSeasonStatus.Active })
  status: PlantingSeasonStatus;

  @OneToMany(() => FieldActivity, (activity) => activity.plantingSeason)
  activities: FieldActivity[];

  @OneToMany(() => Alert, (alert) => alert.plantingSeason)
  alerts: Alert[];
}
