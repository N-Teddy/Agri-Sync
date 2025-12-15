import {
	CallHandler,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger('HTTP');

	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<unknown> {
		const now = Date.now();
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<Request>();

		return next.handle().pipe(
			tap(() => {
				const response = httpContext.getResponse<Response>();
				this.logger.log(
					this.formatMessage(
						request,
						response.statusCode,
						Date.now() - now
					)
				);
			}),
			catchError((error: unknown) => {
				const status = this.resolveStatus(error);
				this.logger.error(
					this.formatMessage(request, status, Date.now() - now),
					error instanceof Error ? error.stack : undefined
				);
				return throwError(() => error);
			})
		);
	}

	private formatMessage(
		request: Request,
		statusCode: number,
		durationMs: number
	): string {
		return `${request.method} ${request.url} ${statusCode} +${durationMs}ms`;
	}

	private resolveStatus(error: unknown): number {
		if (error instanceof HttpException) {
			return error.getStatus();
		}
		return HttpStatus.INTERNAL_SERVER_ERROR;
	}
}
