import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Plantation } from './plantation.entity';

@Entity({ name: 'users' })
@Unique(['email'])
@Index(['googleId'])
export class User extends BaseEntity {
	@Column({ type: 'varchar', length: 255, unique: true })
	email!: string;

	@Column({ type: 'varchar', length: 255 })
	fullName!: string;

	@Column({ type: 'varchar', length: 20, nullable: true })
	phoneNumber?: string | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	passwordHash?: string | null;

	@Column({ type: 'boolean', default: false })
	isEmailVerified!: boolean;

	@Column({ type: 'varchar', length: 255, nullable: true })
	emailVerificationToken?: string | null;

	@Column({ type: 'timestamptz', nullable: true })
	emailVerificationExpiresAt?: Date | null;

	@Column({ type: 'timestamptz', nullable: true })
	emailVerifiedAt?: Date | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	avatarUrl?: string | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	googleId?: string | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	refreshTokenHash?: string | null;

	@Column({ type: 'timestamptz', nullable: true })
	refreshTokenExpiresAt?: Date | null;

	@OneToMany(() => Plantation, (plantation) => plantation.owner)
	plantations?: Plantation[];
}
