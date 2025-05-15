import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createBatcher } from '~/shared/utility/batch';

describe('createBatcher', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should batch multiple requests into a single call', async () => {
		const fetcherSpy = vi
			.fn()
			.mockImplementation(async (keys: string[]) => keys.map((key) => `result:${key}`));

		const batch = createBatcher<string, string>(fetcherSpy);

		// Start multiple requests that should get batched
		const promise1 = batch('key1');
		const promise2 = batch('key2');
		const promise3 = batch('key3');

		// The fetcher shouldn't have been called yet since we're using setTimeout
		expect(fetcherSpy).not.toHaveBeenCalled();

		// Advance timers to trigger the batch operation
		await vi.runAllTimersAsync();

		// The fetcher should have been called exactly once with all keys
		expect(fetcherSpy).toHaveBeenCalledTimes(1);
		expect(fetcherSpy).toHaveBeenCalledWith(['key1', 'key2', 'key3']);

		// All promises should resolve with their respective results
		await expect(promise1).resolves.toBe('result:key1');
		await expect(promise2).resolves.toBe('result:key2');
		await expect(promise3).resolves.toBe('result:key3');
	});

	it('should return cached results for duplicate keys in the same batch', async () => {
		const fetcherSpy = vi
			.fn()
			.mockImplementation(async (keys: string[]) => keys.map((key) => `result:${key}`));

		const batch = createBatcher<string, string>(fetcherSpy);

		// Request the same key multiple times
		const promise1 = batch('key1');
		const promise2 = batch('key1');

		await vi.runAllTimersAsync();

		// The fetcher should have been called exactly once with the key once
		expect(fetcherSpy).toHaveBeenCalledTimes(1);
		expect(fetcherSpy).toHaveBeenCalledWith(['key1']);

		// Both promises should resolve to the same result
		await expect(promise1).resolves.toBe('result:key1');
		await expect(promise2).resolves.toBe('result:key1');
		expect(await promise1).toBe(await promise2);
	});

	it('should respect the timeout option', async () => {
		const fetcherSpy = vi
			.fn()
			.mockImplementation(async (keys: string[]) => keys.map((key) => `result:${key}`));

		const timeout = 100;
		const batch = createBatcher<string, string>(fetcherSpy, { timeout });

		// Start a request
		const promise1 = batch('key1');

		// Advance time but not enough to trigger the batch
		await vi.advanceTimersByTimeAsync(timeout - 1);
		expect(fetcherSpy).not.toHaveBeenCalled();

		// Start another request that should get batched with the first one
		const promise2 = batch('key2');

		// Advance time to just before the new timeout
		await vi.advanceTimersByTimeAsync(timeout - 1);
		expect(fetcherSpy).not.toHaveBeenCalled();

		// Advance time to trigger the batch operation
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcherSpy).toHaveBeenCalledTimes(1);
		expect(fetcherSpy).toHaveBeenCalledWith(['key1', 'key2']);

		await expect(promise1).resolves.toBe('result:key1');
		await expect(promise2).resolves.toBe('result:key2');
	});

	it('should handle fetcher errors by rejecting all promises', async () => {
		const error = new Error('Fetch error');
		const fetcherSpy = vi.fn().mockRejectedValue(error);

		const batch = createBatcher<string, string>(fetcherSpy);

		// Start multiple requests that should get batched
		const promise1 = batch('key1');
		const promise2 = batch('key2');

		// Catch errors to avoid unhandled promise rejections
		promise1.catch(() => {});
		promise2.catch(() => {});

		await vi.runAllTimersAsync();

		// The fetcher should have been called exactly once
		expect(fetcherSpy).toHaveBeenCalledTimes(1);

		// All promises should be rejected with the error
		await expect(promise1).rejects.toBe(error);
		await expect(promise2).rejects.toBe(error);
	});
});
