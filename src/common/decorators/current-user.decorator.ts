import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

export interface RequestUser {
	sub: string;
	email: string;
}

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
		return request.user as RequestUser;
	}
);
