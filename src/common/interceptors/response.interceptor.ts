import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ApiResponse,
  SuccessResponse,
} from '../interfaces/api-response.interface';

const DEFAULT_SUCCESS_MESSAGE = 'Request processed successfully';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value: SuccessResponse<T> | T) => {
        if (this.isSuccessResponse(value)) {
          return value;
        }

        return {
          status: 'success',
          message: DEFAULT_SUCCESS_MESSAGE,
          data: value,
        };
      }),
    );
  }

  private isSuccessResponse(
    value: SuccessResponse<T> | T,
  ): value is SuccessResponse<T> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'status' in value &&
      value.status === 'success' &&
      'message' in value
    );
  }
}
