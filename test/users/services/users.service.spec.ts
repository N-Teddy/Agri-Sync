import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../../src/entities/user.entity';
import { UsersService } from '../../../src/modules/users/users.service';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';

describe('UsersService', () => {
  let service: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SqliteTestingModule, TypeOrmModule.forFeature([User])],
      providers: [UsersService],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('creates and retrieves users', async () => {
    const created = await service.create({
      email: 'user-service@example.com',
      fullName: 'User',
      passwordHash: 'hash',
    });

    const fetched = await service.findByEmail('user-service@example.com');
    expect(fetched?.id).toBe(created.id);
  });

  it('updates user data', async () => {
    const created = await service.create({
      email: 'user-update@example.com',
      fullName: 'Old Name',
      passwordHash: 'hash',
    });

    const updated = await service.update(created.id, {
      fullName: 'New Name',
    });
    expect(updated.fullName).toBe('New Name');
  });
});
