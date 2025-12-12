import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Field } from '../../entities/field.entity';

@Injectable()
export class FieldAccessService {
	constructor(
		@InjectRepository(Field)
		private readonly fieldsRepository: Repository<Field>
	) {}

	async getOwnedField(fieldId: string, ownerId: string): Promise<Field> {
		const field = await this.fieldsRepository.findOne({
			where: { id: fieldId, plantation: { owner: { id: ownerId } } },
			relations: {
				plantation: {
					owner: true,
				},
			},
		});

		if (!field) {
			throw new NotFoundException('Field not found');
		}

		return field;
	}
}
