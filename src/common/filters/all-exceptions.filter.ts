import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		let message = 'Internal server error';
		let errors: Record<string, unknown> | undefined;

		if (exception instanceof HttpException) {
			const response = exception.getResponse();

			if (typeof response === 'string') {
				message = response;
			} else if (response && typeof response === 'object') {
				const responseObject = response as Record<string, unknown>;
				const responseMessage = responseObject['message'];
				if (Array.isArray(responseMessage)) {
					message = 'Validation failed';
					errors = { message: responseMessage };
				} else if (typeof responseMessage === 'string') {
					message = responseMessage;
				}

				if (responseObject['errors']) {
					errors = responseObject['errors'] as Record<
						string,
						unknown
					>;
				}
			}
		}

		const responseBody = {
			status: 'error',
			message,
			errors,
			timestamp: new Date().toISOString(),
			path: request.url,
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, status);
	}
}
