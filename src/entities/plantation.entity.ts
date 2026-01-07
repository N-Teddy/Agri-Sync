import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseUuidEntity } from './base-uuid.entity';
import { Field } from './field.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'plantations' })
export class Plantation extends BaseUuidEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  location?: string | null;

  @Column({ length: 100, default: 'Cameroon' })
  country: string;

  @Column({ length: 100, nullable: true })
  region?: string | null;

  @ManyToOne(() => Profile, (profile) => profile.plantations, { onDelete: 'CASCADE' })
  owner: Profile;

  @Column({ type: 'uuid' })
  ownerId: string;

  @OneToMany(() => Field, (field) => field.plantation)
  fields: Field[];
}
