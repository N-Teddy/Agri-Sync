import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const error =
			exception instanceof HttpException
				? exception.getResponse()
				: (exception as Record<string, unknown>);

		const message =
			(typeof error === 'object' && error !== null && 'message' in error
				? (error.message as string)
				: undefined) ??
			(exception as { message?: string })?.message ??
			'Unexpected error occurred';

		const errorResponse: ErrorResponse = {
			status: 'error',
			message,
			errors:
				typeof error === 'object' && error !== null
					? (error as Record<string, unknown>)
					: null,
			timestamp: new Date().toISOString(),
			path: request.url,
		};

		response.status(status).json(errorResponse);
	}
}
