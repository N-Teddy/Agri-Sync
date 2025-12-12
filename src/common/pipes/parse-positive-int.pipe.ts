import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
	transform(value: string): number {
		const parsedValue = Number(value);

		if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
			throw new BadRequestException('Value must be a positive integer');
		}

		return parsedValue;
	}
}
