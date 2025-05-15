import { createRenderEffect } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';

import { createDeferred, type Deferred } from '~/shared/utility/deferred';
import { createMemoizedResource } from '~/shared/utility/solid/memoized-resource';
import { createTestRoot } from '~/shared/utility/solid/test-utils/create-test-root';

describe('createMemoizedResource', () => {
	it('should create a memoized resource that returns the same resource instance', async () => {
		const fetcher = vi.fn().mockImplementation(() => Promise.resolve(`data-${Math.random()}`));
		const useMemoizedResource = createMemoizedResource(fetcher);

		let result1: string | undefined;
		let firstInstance: ReturnType<typeof useMemoizedResource>;
		createTestRoot(() => {
			firstInstance = useMemoizedResource();
			const [data] = firstInstance;

			createRenderEffect(() => {
				result1 = data();
			});
		});

		let result2: string | undefined;
		let secondInstance: ReturnType<typeof useMemoizedResource>;
		createTestRoot(() => {
			secondInstance = useMemoizedResource();
			const [data] = secondInstance;

			createRenderEffect(() => {
				result2 = data();
			});
		});

		await vi.waitFor(() => {
			expect(result1).toBeDefined();
			expect(result2).toBeDefined();
		});
		expect(result1).toBe(result2);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('should provide a fetch function that awaits resource resolution', async () => {
		const fetcher = vi.fn().mockImplementation(() => Promise.resolve('test-data'));
		const useMemoizedResource = createMemoizedResource(fetcher);

		// Resources fetch as soon as they're created. Test memoized variant doesn't do that.
		expect(fetcher).not.toHaveBeenCalled();

		// Get the resource
		const [data, { fetch }] = useMemoizedResource();
		expect(await fetch()).toEqual('test-data');
		expect(data()).toEqual('test-data');
	});

	it('should reuse existing data with fetch if already loaded', async () => {
		const fetcher = vi.fn().mockImplementation(() => Promise.resolve(`data-${Math.random()}`));
		const useMemoizedResource = createMemoizedResource(fetcher);

		// Get the resource
		const [, { fetch }] = useMemoizedResource();
		expect(await fetch()).toEqual(await fetch());
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('should wait for a pending refetch to complete when fetch is called', async () => {
		let dfd: Deferred<string> | undefined;
		const fetcher = vi.fn().mockImplementation(() => {
			dfd = createDeferred();
			return dfd;
		});

		const useResource = createMemoizedResource<string>(fetcher);
		const [, { fetch, refetch }] = useResource();

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
		const fetcher = vi.fn().mockImplementation(() => Promise.resolve(`data-${n++}`));
		const useMemoizedResource = createMemoizedResource(fetcher);

		let result: string | undefined;
		createTestRoot(() => {
			const [data] = useMemoizedResource();
			createRenderEffect(() => {
				result = data();
			});
		});

		// Wait for initial fetch
		await vi.waitFor(() => {
			expect(result).toBeDefined();
			expect(result).toEqual('data-0');
		});

		// Mark the resource as stale, which should trigger a refetch
		await useMemoizedResource.markAsStale();

		// Should refetch and update with new data
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.waitFor(() => {
			expect(result).toEqual('data-1');
		});
	});

	it('should not refetch when marking a resource as stale with no active consumers', async () => {
		let n = 0;
		const fetcher = vi.fn().mockImplementation(() => Promise.resolve(`data-${n++}`));
		const useMemoizedResource = createMemoizedResource(fetcher);

		const cleanUp = createTestRoot(() => {
			const [data] = useMemoizedResource();
			createRenderEffect(() => {
				data();
			});
		});
		await vi.waitFor(() => {
			expect(fetcher).toHaveBeenCalledTimes(1);
		});
		cleanUp();

		// Mark the resource as stale
		// Should not refetch because there are no active consumers
		await useMemoizedResource.markAsStale();
		expect(fetcher).toHaveBeenCalledTimes(1);

		// Using the resource again should use the stale value and trigger a refetch
		let result: string | undefined;
		createTestRoot(() => {
			const [data] = useMemoizedResource();
			createRenderEffect(() => {
				result = data();
			});
		});
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.waitFor(() => {
			expect(result).toEqual('data-1');
		});
	});
});
