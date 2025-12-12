import { Injectable } from '@nestjs/common';
import {
	HealthCheckResult,
	HealthCheckService,
	MemoryHealthIndicator,
} from '@nestjs/terminus';

const MAX_HEAP_BYTES = 150 * 1024 * 1024;
const MAX_RSS_BYTES = 300 * 1024 * 1024;

@Injectable()
export class HealthService {
	constructor(
		private readonly health: HealthCheckService,
		private readonly memory: MemoryHealthIndicator
	) {}

	check(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.memory.checkHeap('memory_heap', MAX_HEAP_BYTES),
			() => this.memory.checkRSS('memory_rss', MAX_RSS_BYTES),
		]);
	}
}
