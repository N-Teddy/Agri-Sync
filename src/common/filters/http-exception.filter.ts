import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const { message, errors } = this.normalizeError(exception, status);

		this.logger.error(
			`${request.method} ${request.url} failed (${status}) - ${message}`,
			exception instanceof Error ? exception.stack : undefined
		);

		const errorResponse: ErrorResponse = {
			status: 'error',
			message,
			errors,
			timestamp: new Date().toISOString(),
			path: request.url,
		};

		response.status(status).json(errorResponse);
	}

	private normalizeError(
		exception: unknown,
		status: number
	): Pick<ErrorResponse, 'message' | 'errors'> {
		if (exception instanceof HttpException) {
			const errorResponse = exception.getResponse();
			if (typeof errorResponse === 'string') {
				return { message: errorResponse, errors: null };
			}

			if (typeof errorResponse === 'object' && errorResponse !== null) {
				const responseObj = errorResponse as Record<string, unknown>;
				const messages = responseObj.message;

				if (Array.isArray(messages)) {
					return {
						message: 'Validation failed',
						errors: messages,
					};
				}

				if (typeof messages === 'string') {
					return {
						message: messages,
						errors: responseObj,
					};
				}

				return {
					message: exception.message,
					errors: responseObj,
				};
			}
		}

		if (exception instanceof Error) {
			return { message: exception.message, errors: null };
		}

		const fallbackMessage =
			status === HttpStatus.INTERNAL_SERVER_ERROR
				? 'Internal server error'
				: 'Unexpected error occurred';

		return { message: fallbackMessage, errors: null };
	}
}
