import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { AlertSeverity } from '../../../common/enums/alert-severity.enum';
import { AlertType } from '../../../common/enums/alert-type.enum';

export class GetAlertsQueryDto {
	@ApiPropertyOptional({
		description: 'Filter by field ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsOptional()
	@IsUUID()
	fieldId?: string;

	@ApiPropertyOptional({
		description: 'Filter by alert type',
		enum: AlertType,
	})
	@IsOptional()
	@IsEnum(AlertType)
	alertType?: AlertType;

	@ApiPropertyOptional({
		description: 'Filter by severity',
		enum: AlertSeverity,
	})
	@IsOptional()
	@IsEnum(AlertSeverity)
	severity?: AlertSeverity;

	@ApiPropertyOptional({
		description: 'Show only unacknowledged alerts',
		example: true,
	})
	@IsOptional()
	unacknowledgedOnly?: boolean;

	@ApiPropertyOptional({
		description: 'Show only unresolved alerts',
		example: true,
	})
	@IsOptional()
	unresolvedOnly?: boolean;
}
