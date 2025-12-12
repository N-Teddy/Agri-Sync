import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Field } from '../../../src/entities/field.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { User } from '../../../src/entities/user.entity';
import { FieldAccessService } from '../../../src/modules/fields/field-access.service';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';
import { TestConfigModule } from '../../utils/test-config.module';

describe('FieldAccessService', () => {
	let service: FieldAccessService;
	let usersRepo: Repository<User>;
	let plantationsRepo: Repository<Plantation>;
	let fieldsRepo: Repository<Field>;
	let owner: User;
	let otherOwner: User;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				TestConfigModule,
				SqliteTestingModule,
				TypeOrmModule.forFeature([User, Plantation, Field]),
			],
			providers: [FieldAccessService],
		}).compile();

		service = moduleRef.get(FieldAccessService);
		usersRepo = moduleRef.get(getRepositoryToken(User));
		plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
		fieldsRepo = moduleRef.get(getRepositoryToken(Field));

		owner = await usersRepo.save(
			usersRepo.create({
				email: 'field-owner@example.com',
				fullName: 'Owner',
				passwordHash: 'hash',
				isEmailVerified: true,
			})
		);

		otherOwner = await usersRepo.save(
			usersRepo.create({
				email: 'other-owner@example.com',
				fullName: 'Other Owner',
				passwordHash: 'hash',
				isEmailVerified: true,
			})
		);
	});

	beforeEach(async () => {
		await fieldsRepo.clear();
		await plantationsRepo.clear();
	});

	it('returns field when owner matches', async () => {
		const plantation = await plantationsRepo.save(
			plantationsRepo.create({
				owner,
				name: 'Owner Estate',
				location: 'Buea',
				region: 'SW',
			})
		);

		const field = await fieldsRepo.save(
			fieldsRepo.create({
				plantation,
				name: 'Plot 1',
			})
		);

		const result = await service.getOwnedField(field.id, owner.id);
		expect(result.id).toBe(field.id);
	});

	it('throws when owner mismatch', async () => {
		const plantation = await plantationsRepo.save(
			plantationsRepo.create({
				owner: otherOwner,
				name: 'Other Estate',
				location: 'Bafoussam',
				region: 'WC',
			})
		);

		const field = await fieldsRepo.save(
			fieldsRepo.create({
				plantation,
				name: 'Plot 2',
			})
		);

		await expect(service.getOwnedField(field.id, owner.id)).rejects.toThrow(
			'Field not found'
		);
	});
});
