import { describe, expect, it } from 'vitest';

import { syncOrPromise } from '~/shared/utility/sync-or-promise';

describe('syncOrPromise', () => {
	it('should handle synchronous values', () => {
		const result = syncOrPromise(5, (value) => value * 2);
		expect(result).toBe(10);
	});

	it('should handle asynchronous values', async () => {
		const result = await syncOrPromise(Promise.resolve(5), (value) => value * 2);
		expect(result).toBe(10);
	});
});
