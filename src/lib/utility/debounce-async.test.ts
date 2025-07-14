import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounceNextAsync, debouncePrevAsync } from '~/lib/utility/debounce-async';
import { createDeferred } from '~/lib/utility/deferred';

describe('debouncePrevAsync', () => {
	it('should debounce calls', async () => {
		let callCount = 0;
		const debounced = debouncePrevAsync(async () => {
			callCount++;
			return callCount;
		});

		const results = await Promise.all([debounced(), debounced(), debounced()]);

		expect(results).toEqual([1, 1, 1]);
		expect(callCount).toBe(1);
	});

	it('should call again after the first call is done', async () => {
		let callCount = 0;
		const debounced = debouncePrevAsync(async () => {
			callCount++;
			return callCount;
		});

		expect(await debounced()).toBe(1);
		expect(await debounced()).toBe(2);
		expect(callCount).toBe(2);
	});
});

describe('debounceNextAsync', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should consolidate multiple calls within the timeout window', async () => {
		let callCount = 0;
		const debounced = debounceNextAsync(async () => {
			callCount++;
			return callCount;
		}, 100);

		const promise1 = debounced();
		const promise2 = debounced();
		const promise3 = debounced();
		await vi.advanceTimersByTimeAsync(100);
		const results = await Promise.all([promise1, promise2, promise3]);
		expect(results).toEqual([1, 1, 1]);
		expect(callCount).toBe(1);

		const promise4 = debounced();
		await vi.advanceTimersByTimeAsync(100);
		const result4 = await promise4;
		expect(result4).toBe(2);
		expect(callCount).toBe(2);
	});

	it('should reset the timeout when called again before execution', async () => {
		let callCount = 0;
		const debounced = debounceNextAsync(async () => {
			callCount++;
			return callCount;
		}, 100);

		const promise1 = debounced();
		await vi.advanceTimersByTimeAsync(50);

		const promise2 = debounced();
		await vi.advanceTimersByTimeAsync(50);

		const promise3 = debounced();
		await vi.advanceTimersByTimeAsync(50);
		expect(callCount).toBe(0);

		await vi.advanceTimersByTimeAsync(50);
		const results = await Promise.all([promise1, promise2, promise3]);

		expect(results).toEqual([1, 1, 1]);
		expect(callCount).toBe(1);
	});

	it('should wait for any running call to complete before executing the next batch', async () => {
		let callCount = 0;
		const firstCall = createDeferred<number>();

		const debounced = debounceNextAsync(async () => {
			callCount++;
			if (callCount === 1) {
				return firstCall;
			}
			return callCount;
		}, 100);

		// Start the first execution
		const initialPromise = debounced();
		await vi.advanceTimersByTimeAsync(100);
		expect(callCount).toBe(1);

		// Start another batch while the first is still running
		const laterPromise1 = debounced();
		const laterPromise2 = debounced();
		await vi.advanceTimersByTimeAsync(100);
		expect(callCount).toBe(1);

		// Resolve the first call
		firstCall.resolve(42);
		await expect(initialPromise).resolves.toBe(42);

		// Now the second batch should execute
		await vi.advanceTimersByTimeAsync(0);
		expect(callCount).toBe(2);
		const results = await Promise.all([laterPromise1, laterPromise2]);
		expect(results).toEqual([2, 2]);
	});

	it('should handle errors properly', async () => {
		const testError = new Error('Test error');
		let callCount = 0;

		const debounced = debounceNextAsync(async () => {
			callCount++;
			if (callCount === 1) {
				throw testError;
			}
			return callCount;
		}, 100);

		// Store promises to test later
		const promise1 = debounced();
		const promise2 = debounced();

		// Add catch handlers immediately to avoid unhandled rejections with Vitest
		const p1Catch = promise1.catch((e) => e);
		const p2Catch = promise2.catch((e) => e);

		// Advance timer to trigger the execution
		await vi.advanceTimersByTimeAsync(100);

		// Verify the results through our caught promises
		expect(await p1Catch).toBe(testError);
		expect(await p2Catch).toBe(testError);
		expect(callCount).toBe(1);

		// The next call should work after the error
		const promise3 = debounced();
		await vi.advanceTimersByTimeAsync(100);
		expect(await promise3).toBe(2);
		expect(callCount).toBe(2);
	});

	it('should consolidate multiple calls while promise pending, even after timeout', async () => {
		let callCount = 0;
		const firstCall = createDeferred<number>();

		const debounced = debounceNextAsync(async () => {
			callCount++;
			if (callCount === 1) {
				return firstCall;
			}
			return callCount;
		}); // 0ms

		// Start the first execution
		const initialPromise = debounced();
		await vi.advanceTimersByTimeAsync(1);
		expect(callCount).toBe(1);

		// Start another batch while the first is still running
		const laterPromise1 = debounced();
		await vi.advanceTimersByTimeAsync(1);
		const laterPromise2 = debounced();
		await vi.advanceTimersByTimeAsync(1);
		expect(callCount).toBe(1);

		// Resolve the first call
		firstCall.resolve(42);
		await expect(initialPromise).resolves.toBe(42);

		// Now the second batch should execute
		await vi.advanceTimersByTimeAsync(0);
		expect(callCount).toBe(2);
		const results = await Promise.all([laterPromise1, laterPromise2]);
		expect(results).toEqual([2, 2]);
	});
});
