import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity({ name: 'sync_tombstones' })
export class SyncTombstone extends BaseEntity {
	@Column({ type: 'uuid' })
	@Index()
	userId!: string;

	@Column({ type: 'varchar', length: 50 })
	@Index()
	entityType!: string;

	@Column({ type: 'uuid' })
	@Index()
	entityId!: string;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	@Index()
	deletedAt!: Date;
}
