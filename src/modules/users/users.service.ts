import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>
	) {}

	findByEmail(email: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { email } });
	}

	findById(id: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id } });
	}

	findByGoogleId(googleId: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { googleId } });
	}

	async create(data: Partial<User>): Promise<User> {
		const user = this.usersRepository.create(data);
		return this.usersRepository.save(user);
	}

	findByVerificationToken(token: string): Promise<User | null> {
		return this.usersRepository.findOne({
			where: { emailVerificationToken: token },
		});
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const user = await this.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		Object.assign(user, data);
		return this.usersRepository.save(user);
	}
}
