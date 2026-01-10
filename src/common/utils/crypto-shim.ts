import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
	// Provide a global crypto for libraries that expect it in CommonJS.
	(globalThis as any).crypto = webcrypto;
}
