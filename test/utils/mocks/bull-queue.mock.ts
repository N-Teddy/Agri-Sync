import { EMAIL_QUEUE } from '../../../src/modules/email/email.constants';

export interface FakeBullJob<T> {
	name: string;
	data: T;
}

export class FakeQueue<T> {
	public jobs: FakeBullJob<T>[] = [];

	async add(name: string, data: T) {
		this.jobs.push({ name, data });
		return { id: this.jobs.length, name };
	}
}

export const createBullQueueProvider = () => ({
	provide: EMAIL_QUEUE,
	useValue: new FakeQueue(),
});
