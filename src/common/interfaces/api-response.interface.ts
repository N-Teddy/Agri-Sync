export interface SuccessResponse<T> {
	status: 'success';
	message: string;
	data?: T;
}

export interface ErrorResponse {
	status: 'error';
	message: string;
	errors?: string[] | Record<string, unknown> | null;
	timestamp: string;
	path: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
