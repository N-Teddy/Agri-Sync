import { BadRequestException } from '@nestjs/common';
import { formatISO, isValid, parseISO } from 'date-fns';

export const normalizeDateInput = (value: string): string => {
	const parsed = parseISO(value);

	if (!isValid(parsed)) {
		throw new BadRequestException('Invalid date value');
	}

	return formatISO(parsed, { representation: 'date' });
};
