import type { SuccessResponse } from '../interfaces/api-response.interface';

export const buildSuccessResponse = <T>(
  message: string,
  data?: T,
): SuccessResponse<T> => ({
  status: 'success',
  message,
  data,
});
