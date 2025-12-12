import { Expose } from 'class-transformer';

export class HealthResponseDto {
	@Expose()
	status!: string;

	@Expose()
	uptime!: number;

	@Expose()
	timestamp!: string;
}
