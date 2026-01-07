import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../constants/auth.constants';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly configService: ConfigService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()]
		);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const authHeader = request.headers['authorization'];

		if (!authHeader) {
			throw new UnauthorizedException('Missing authorization header');
		}

		const [scheme, token] = authHeader.split(' ');
		if (scheme !== 'Bearer' || !token) {
			throw new UnauthorizedException('Invalid authorization header');
		}

		const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
		if (!jwtSecret) {
			throw new UnauthorizedException(
				'Supabase JWT secret not configured'
			);
		}

		try {
			const { payload } = await jwtVerify(
				token,
				new TextEncoder().encode(jwtSecret),
				{
					algorithms: ['HS256'],
				}
			);
			request['user'] = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}
}
