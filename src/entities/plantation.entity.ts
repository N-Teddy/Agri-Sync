import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Field } from './field.entity';
import { User } from './user.entity';

@Entity({ name: 'plantations' })
export class Plantation extends BaseEntity {
	@Column({ type: 'varchar', length: 255 })
	name!: string;

	@Column({ type: 'varchar', length: 255 })
	location!: string;

	@Column({ type: 'varchar', length: 100 })
	region!: string;

	@ManyToOne(() => User, (user) => user.plantations, {
		onDelete: 'CASCADE',
	})
	@Index() // Index on owner_id
	owner!: User;

	@OneToMany(() => Field, (field) => field.plantation)
	fields?: Field[];
}
