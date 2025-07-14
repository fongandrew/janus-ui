import { describe, expect, it } from 'vitest';

import { createDeferred, isDeferred } from '~/lib/utility/deferred';

describe('createDeferred', () => {
	it('should create a deferred promise that resolves', async () => {
		const deferred = createDeferred<number>();
		expect(deferred.status()).toBe('pending');

		deferred.resolve(1);
		expect(deferred.status()).toBe('resolved');
		expect(await deferred).toBe(1);
	});

	it('should create a deferred promise that rejects', async () => {
		const deferred = createDeferred<number>();
		deferred.reject(new Error('test'));
		expect(deferred.status()).toBe('rejected');
		await expect(deferred).rejects.toThrow('test');
	});

	describe('isDeferred', () => {
		it('is true with deferred', () => {
			const deferred = createDeferred<number>();
			expect(isDeferred(deferred)).toBe(true);
		});

		it('is false with regular Promise', () => {
			expect(isDeferred(Promise.resolve(1))).toBe(false);
		});
	});
});
