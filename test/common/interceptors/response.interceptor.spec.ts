import { of } from 'rxjs';

import { ResponseInterceptor } from '../../../src/common/interceptors/response.interceptor';

describe('ResponseInterceptor', () => {
	it('wraps plain responses into success envelope', (done) => {
		const interceptor = new ResponseInterceptor();
		const callHandler = {
			handle: () => of({ hello: 'world' }),
		};
		interceptor
			.intercept({} as never, callHandler as never)
			.subscribe((value) => {
				expect(value.status).toBe('success');
				expect(value.data).toEqual({ hello: 'world' });
				done();
			});
	});

	it('passes through preformatted success responses', (done) => {
		const interceptor = new ResponseInterceptor();
		const callHandler = {
			handle: () =>
				of({
					status: 'success',
					message: 'ok',
					data: { hello: 'world' },
				}),
		};
		interceptor
			.intercept({} as never, callHandler as never)
			.subscribe((value) => {
				expect(value.message).toBe('ok');
				done();
			});
	});
});
