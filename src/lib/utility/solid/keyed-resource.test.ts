import { createRenderEffect, createSignal, type Setter } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';

import { createDeferred, type Deferred } from '~/lib/utility/deferred';
import { createKeyedResource } from '~/lib/utility/solid/keyed-resource';
import { createTestRoot } from '~/lib/utility/solid/test-utils/create-test-root';

describe('createKeyedResource', () => {
	it('should create a resource for a given key', async () => {
		const fetcher = vi.fn().mockResolvedValue('test-data');
		const useResource = createKeyedResource<string, string>(fetcher);

		let result: unknown;
		createTestRoot(() => {
			const currentKey = 'test-key';
			const [data] = useResource(() => currentKey);

			createRenderEffect(() => {
				result = data();
			});
		});

		// Initial state should be undefined (loading)
		expect(result).toBeUndefined();
		expect(fetcher).toHaveBeenCalledWith('test-key');

		// Wait for fetch
		await vi.waitFor(() => {
			expect(result).toEqual('test-data');
		});
	});

	it('should cache resources by key', async () => {
		const [key, setKey] = createSignal(0);

		const fetcher = vi.fn().mockImplementation(async (key: number) => `data-for-${key}`);
		const useResource = createKeyedResource<string, number>(fetcher);

		let result: unknown;
		createTestRoot(() => {
			const [data] = useResource(key);
			createRenderEffect(() => {
				result = data();
			});
		});

		// Wait for initial fetch
		await vi.waitFor(() => {
			expect(result).toEqual('data-for-0');
		});

		// Change key
		setKey(1);
		await vi.waitFor(() => {
			expect(result).toEqual('data-for-1');
		});

		// Switch back, this should be instantaneous because it's previously cached
		// and should not refetch
		fetcher.mockClear();
		setKey(0);
		expect(result).toEqual('data-for-0');
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('should support refetch functionality', async () => {
		let n = 0;
		const fetcher = vi.fn().mockImplementation(async (_key: number) => `data-${n++}`);
		const useResource = createKeyedResource<string, number>(fetcher);

		let refetch:
			| ((info?: unknown) => Promise<string | undefined> | string | null | undefined)
			| undefined;
		let result: string | undefined;
		createTestRoot(() => {
			const [data, { refetch: refetchFn }] = useResource(() => 0);
			refetch = refetchFn;
			createRenderEffect(() => {
				result = data();
			});
		});

		// Wait for initial fetch
		await vi.waitFor(() => {
			expect(result).toEqual('data-0');
		});

		// Refetch the resource
		await refetch?.();

		// Wait for initial fetch
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.waitFor(() => {
			expect(result).toEqual('data-1');
		});
	});

	it('should support mutate functionality', async () => {
		const fetcher = vi.fn().mockResolvedValue('initial-data');
		const useResource = createKeyedResource<string, number>(fetcher);

		let result: string | undefined;
		let mutate: Setter<string | undefined> | undefined;
		createTestRoot(() => {
			const [data, { mutate: mutateFn }] = useResource(() => 0);
			mutate = mutateFn;
			createRenderEffect(() => {
				result = data();
			});
		});

		// Wait for initial fetch to complete
		await vi.waitFor(() => {
			expect(result).toBe('initial-data');
		});

		// Mutate the resource
		mutate?.('updated-data');

		// Data should be updated without calling fetcher again
		expect(result).toBe('updated-data');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('should reactively update other uses of the resource with same key', async () => {
		const fetcher = vi.fn().mockResolvedValue('initial-data');
		const useResource = createKeyedResource<string, number>(fetcher);

		let result: string | undefined;
		createTestRoot(() => {
			const [data] = useResource(() => 0);
			createRenderEffect(() => {
				result = data();
			});
		});

		let mutate: Setter<string | undefined> | undefined;
		createTestRoot(() => {
			const [, { mutate: mutateFn }] = useResource(() => 0);
			mutate = mutateFn;
		});

		// Wait for initial fetch to complete
		await vi.waitFor(() => {
			expect(result).toBe('initial-data');
		});

		// Mutate the resource
		mutate?.('updated-data');

		// Resource should be updated in all components using the same key
		await vi.waitFor(() => {
			expect(result).toBe('updated-data');
		});
	});

	it('should expose loading, error, latest, and state properties on the accessor', async () => {
		// Set up a controlled promise for testing loading state
		const dfd = createDeferred<string>();
		const useResource = createKeyedResource<string, number>(() => dfd);

		let accessorLoading: boolean | undefined;
		let accessorError: any;
		let accessorLatest: string | undefined;
		let accessorState: string | undefined;
		let result: string | undefined;

		createTestRoot(() => {
			const [data] = useResource(() => 0);
			createRenderEffect(() => {
				result = data();
				accessorLoading = data.loading;
				accessorError = data.error;
				accessorLatest = data.latest;
				accessorState = data.state;
			});
		});

		// Initial state should have loading=true, no error, no latest value
		expect(accessorLoading).toBe(true);
		expect(accessorError).toBeUndefined();
		expect(accessorLatest).toBeUndefined();
		expect(accessorState).toBe('pending');
		expect(result).toBeUndefined();

		// Resolve the promise
		dfd.resolve('test-data');

		// After resolution, loading should be false, still no error, latest and result should match
		await vi.waitFor(() => {
			expect(accessorLoading).toBe(false);
			expect(accessorError).toBeUndefined();
			expect(accessorLatest).toBe('test-data');
			expect(accessorState).toBe('ready');
			expect(result).toBe('test-data');
		});
	});

	it('should provide a fetch function that can be used outside a render context', async () => {
		const useResource = createKeyedResource<string, number>((val) =>
			Promise.resolve(`test-data-${val}`),
		);
		const [data, { fetch }] = useResource(() => 0);
		expect(await fetch()).toBe('test-data-0');
		expect(data()).toBe('test-data-0');
	});

	it('should reuse existing data with fetch if already loaded', async () => {
		const fetcher = vi
			.fn()
			.mockImplementation((val: number) => Promise.resolve(`test-data-${val}`));
		const useResource = createKeyedResource<string, number>(fetcher);
		const [, { fetch }] = useResource(() => 0);
		expect(await fetch()).toBe('test-data-0');
		expect(await fetch()).toBe('test-data-0');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('should throw an error when fetch is called and resource errors', async () => {
		const testError = new Error('Test resource error');
		const useResource = createKeyedResource<string, number>(() => Promise.reject(testError));
		const [, { fetch }] = useResource(() => 0);
		await expect(fetch()).rejects.toThrow(testError);
	});

	it('should wait for a pending refetch to complete when fetch is called', async () => {
		let dfd: Deferred<string> | undefined;
		const fetcher = vi.fn().mockImplementation(() => {
			dfd = createDeferred();
			return dfd;
		});

		const useResource = createKeyedResource<string, number>(fetcher);
		const [, { fetch, refetch }] = useResource(() => 0);

		let fetchP = fetch();
		dfd?.resolve('test-a');
		expect(await fetchP).toBe('test-a');

		const refetchP = refetch();
		fetchP = fetch();
		dfd?.resolve('test-b');
		expect(await refetchP).toBe('test-b');
		expect(await fetchP).toBe('test-b');
	});

	it('should support markAsStale functionality to refresh data', async () => {
		let n = 0;
		const fetcher = vi.fn().mockImplementation(async (_key: number) => `data-${n++}`);
		const useResource = createKeyedResource<string, number>(fetcher);

		let result: string | undefined;
		createTestRoot(() => {
			const [data] = useResource(() => 0);
			createRenderEffect(() => {
				result = data();
			});
		});

		// Wait for initial fetch
		await vi.waitFor(() => {
			expect(result).toEqual('data-0');
		});

		// Mark the resource as stale, which should trigger a refetch
		await useResource.markAsStale(0);

		// Should refetch and update with new data
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.waitFor(() => {
			expect(result).toEqual('data-1');
		});
	});

	it('should not refetch when marking a resource as stale with no active consumers', async () => {
		let n = 0;
		const fetcher = vi.fn().mockImplementation(async (_key: number) => `data-${n++}`);
		const useResource = createKeyedResource<string, number>(fetcher);

		// Mount and unmount a component to create an initial consumer
		const cleanup = createTestRoot(() => {
			const [data] = useResource(() => 0);
			createRenderEffect(() => {
				data();
			});
		});
		await vi.waitFor(() => {
			expect(fetcher).toHaveBeenCalledTimes(1);
		});
		cleanup();

		// Mark the resource as stale but should not refetch because
		// there are no active consumers
		await useResource.markAsStale(0);
		expect(fetcher).toHaveBeenCalledTimes(1);

		// Using the resource again should use the stale value and trigger a refetch
		let result: string | undefined;
		createTestRoot(() => {
			const [data] = useResource(() => 0);
			createRenderEffect(() => {
				result = data();
			});
		});

		// Should refetch and update with new data
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.waitFor(() => {
			expect(result).toEqual('data-1');
		});
	});
});
