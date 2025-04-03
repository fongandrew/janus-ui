import { describe, expect, it } from 'vitest';

import { debounceOneAsync } from '~/shared/utility/debounce-one-async';

describe('debounceOneAsync', () => {
	it('should debounce calls', async () => {
		let callCount = 0;
		const debounced = debounceOneAsync(async () => {
			callCount++;
			return callCount;
		});

		const results = await Promise.all([debounced(), debounced(), debounced()]);

		expect(results).toEqual([1, 1, 1]);
		expect(callCount).toBe(1);
	});

	it('should call again after the first call is done', async () => {
		let callCount = 0;
		const debounced = debounceOneAsync(async () => {
			callCount++;
			return callCount;
		});

		expect(await debounced()).toBe(1);
		expect(await debounced()).toBe(2);
		expect(callCount).toBe(2);
	});
});
