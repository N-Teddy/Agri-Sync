import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { Plantation } from './plantation.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'users' })
@Unique(['email'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @OneToMany(() => Plantation, (plantation) => plantation.owner)
  plantations?: Plantation[];
}
