import { until } from '@solid-primitives/promise';
import {
	createRenderEffect,
	createResource,
	getOwner,
	onCleanup,
	type ResourceFetcher,
	type ResourceReturn,
} from 'solid-js';

import { memoizeOne } from '~/lib/utility/memoize/memoize-one';
import { useResourceContext } from '~/lib/utility/solid/resource-context';

export type MemoizedResourceReturn<TResource, TInfo> = readonly [
	ResourceReturn<TResource, TInfo>[0],
	ResourceReturn<TResource, TInfo>[1] & {
		/**
		 * Awaits until resource is resolved. Unlike refetch, this uses the existing
		 * value if it already exists.
		 */
		fetch: (forceRefetch?: boolean) => Promise<TResource>;
	},
];

/**
 * Factory for a SolidJS resource that's cached globally by key. The default SolidJS
 * resource exposes a "source" signal that gets passed to the fetcher but it doesn't
 * use previously stored value when the signal changes (it always refetches).
 *
 * This caches the entire signal itself so subsequent fetches use the previously
 * stored value.
 */
export function createMemoizedResource<TResource, TInfo = unknown>(
	fetcher: ResourceFetcher<true, TResource, TInfo>,
) {
	const getResource = memoizeOne(() => createResource<TResource, TInfo>(fetcher));

	let useCount = 0;
	let stale = false;

	/** Trigger refetch for stale value */
	async function refetchStale() {
		const [data, { refetch }] = getResource();
		if (data.state === 'pending' || data.state === 'refreshing') return;
		stale = false;
		try {
			return await refetch();
		} finally {
			stale = false;
		}
	}

	/** Mark the resource as stale, which will maybe trigger a refetch */
	async function markAsStale() {
		stale = true;
		if (useCount) {
			await refetchStale();
		}
	}

	function useResource(): MemoizedResourceReturn<TResource, TInfo> {
		const [data, setters] = getResource();

		const accessor = (() => {
			if (stale) {
				refetchStale();
			}
			return data();
		}) as typeof data;

		// Expose loading, error, and latest reactive properties on the accessor function
		Object.defineProperties(accessor, {
			loading: {
				get: () => data.loading,
			},
			error: {
				get: () => data.error,
			},
			latest: {
				get: () => {
					if (stale) {
						refetchStale();
					}
					return data.latest;
				},
			},
			state: {
				get: () => data.state,
			},
		});

		// Increment usage count when using in an owned scope so we know whether
		// to automatically refetch when the resource is marked as stale (instead of
		// waiting for the next accessor call)
		if (getOwner()) {
			createRenderEffect(() => {
				useCount++;
				onCleanup(() => {
					useCount--;
				});
			});
		}

		return [
			accessor,
			{
				...setters,
				fetch: async (forceRefetch = false) => {
					if (forceRefetch && (data.state === 'ready' || data.state === 'errored')) {
						return setters.refetch() as TResource;
					}
					await until(() => data.state === 'ready' || data.state === 'errored');
					return data() as TResource;
				},
			},
		] as const;
	}

	useResource.clear = () => getResource.cache.clear();
	useResource.markAsStale = markAsStale;

	useResourceContext().add(useResource);

	return useResource;
}
