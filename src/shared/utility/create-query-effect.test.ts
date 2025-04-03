import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryEffect } from '~/shared/utility/create-query-effect';
import { createDeferred, type Deferred } from '~/shared/utility/deferred';

describe('createQueryEffect', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should call the fetcher function with the provided query and signal', async () => {
		const mockFetcher = vi.fn().mockResolvedValue('test-data');
		const queryFn = createQueryEffect(mockFetcher);

		const promise = queryFn('test-query');
		vi.runAllTimers();
		await promise;

		expect(mockFetcher).toHaveBeenCalledWith('test-query', expect.any(AbortSignal));
	});

	it('should debounce multiple calls', async () => {
		const mockFetcher = vi.fn().mockResolvedValue('test-data');
		const queryFn = createQueryEffect(mockFetcher, { debounceMs: 200 });

		queryFn('query1');
		queryFn('query2');
		queryFn('query3');

		vi.advanceTimersByTime(199);
		expect(mockFetcher).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(mockFetcher).toHaveBeenCalledTimes(1);
		expect(mockFetcher).toHaveBeenCalledWith('query3', expect.any(AbortSignal));
	});

	it('should abort previous requests when a new one is made', async () => {
		const abortMock = vi.fn();

		const deferreds: Record<string, Deferred<string>> = {};
		const mockFetcher = vi.fn().mockImplementation((query, signal) => {
			signal.addEventListener('abort', abortMock);
			return (deferreds[query] ??= createDeferred());
		});

		const queryFn = createQueryEffect(mockFetcher);
		const q1 = queryFn('query1');
		vi.runAllTimers();
		expect(abortMock).not.toHaveBeenCalled();

		const q2 = queryFn('query2');
		vi.runAllTimers();
		expect(abortMock).toHaveBeenCalledTimes(1);

		expect(await q1).toBeUndefined();
		deferreds['query2']?.resolve('test-data');
		expect(await q2).toBe('test-data');
	});

	it('should call onFetched callback with the fetched data', async () => {
		const mockFetcher = vi.fn().mockResolvedValue('test-data');
		const onFetched = vi.fn();

		const queryFn = createQueryEffect(mockFetcher, onFetched);

		const promise = queryFn('test-query');
		vi.runAllTimers();
		await promise;

		expect(onFetched).toHaveBeenCalledWith('test-data');
	});

	it('should reject the promise when fetcher fails', async () => {
		const error = new Error('Fetch failed');
		const mockFetcher = vi.fn().mockRejectedValue(error);

		const queryFn = createQueryEffect(mockFetcher);

		const promise = queryFn('test-query');
		vi.runAllTimers();

		await expect(promise).rejects.toThrow('Fetch failed');
	});

	it('should not catch abort error when catchAbort is false', async () => {
		const deferreds: Record<string, Deferred<string>> = {};
		const mockFetcher = vi.fn().mockImplementation((query) => {
			return (deferreds[query] ??= createDeferred());
		});

		const queryFn = createQueryEffect(mockFetcher, { catchAbort: false });

		const promise1 = queryFn('query1');
		vi.runAllTimers();

		// This should abort the first request
		queryFn('query2');
		vi.runAllTimers();

		// The first promise should reject with an AbortError
		await expect(promise1).rejects.toThrow('The operation was aborted.');
	});
});
