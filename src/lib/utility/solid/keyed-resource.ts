import { until } from '@solid-primitives/promise';
import {
	createRenderEffect,
	createResource,
	getOwner,
	onCleanup,
	type Resource,
	type ResourceReturn,
} from 'solid-js';

import { memoizeLRUSingleArg } from '~/lib/utility/memoize/memoize-lru';
import { type MemoizedResourceReturn } from '~/lib/utility/solid/memoized-resource';
import { useResourceContext } from '~/lib/utility/solid/resource-context';

/**
 * Factory for a SolidJS resource that's cached globally by key. The default SolidJS
 * resource exposes a "source" signal that gets passed to the fetcher but it doesn't
 * use previously stored value when the signal changes (it always refetches).
 *
 * This caches the entire signal itself so subsequent fetches use the previously
 * stored value.
 */
export function createKeyedResource<TResource, TKey, TInfo = unknown>(
	fetcher: (key: TKey) => Promise<TResource>,
	opts?: { capacity?: number },
) {
	const getResourceForKey = memoizeLRUSingleArg((key: TKey) => {
		const [data, setters] = createResource(() => fetcher(key));
		return [Object.assign(data, { stale: false }), setters] as const;
	}, opts);

	/** Track component usage so we know when to trigger refetch if marked as stale */
	const usage = new Map<TKey, number>();

	/** Trigger refetch for stale key */
	async function refetchStale(key: TKey) {
		const [data, { refetch }] = getResourceForKey(key);
		if (data.state === 'pending' || data.state === 'refreshing') return;
		data.stale = false;
		try {
			return await refetch();
		} finally {
			data.stale = false;
		}
	}

	/** Mark the resource as stale, which will maybe trigger a refetch */
	async function markAsStale(key: TKey) {
		if (!getResourceForKey.cache.has(getResourceForKey.resolve(key))) return;
		getResourceForKey(key)[0].stale = true;
		if (usage.get(key) ?? 0) {
			await refetchStale(key);
		}
	}

	function useResource(keyAccessor: () => TKey): MemoizedResourceReturn<TResource, TInfo> {
		const getResource = () => getResourceForKey(keyAccessor());
		const accessor = (() => {
			const [data] = getResource();
			if (data?.stale) {
				refetchStale(keyAccessor());
			}
			return data();
		}) as Resource<TResource>;
		const refetch = (info?: TInfo) => getResource()[1].refetch(info);
		const mutate = (value: any) => getResource()[1].mutate(value as any);
		const fetch = async (forceRefetch = false) => {
			const [data] = getResource();
			if (forceRefetch && (data.state === 'ready' || data.state === 'errored')) {
				return refetch() as TResource;
			}
			await until(() => data.state === 'ready' || data.state === 'errored');
			return data() as TResource;
		};

		// Expose loading, error, and latest reactive properties on the accessor function
		Object.defineProperties(accessor, {
			loading: {
				get: () => getResource()[0].loading,
			},
			error: {
				get: () => getResource()[0].error,
			},
			latest: {
				get: () => {
					const [data] = getResource();
					if (data?.stale) {
						refetchStale(keyAccessor());
					}
					return data.latest;
				},
			},
			state: {
				get: () => getResource()[0].state,
			},
		});

		// Increment usage count when using in an owned scope so we know whether
		// to automatically refetch when the resource is marked as stale (instead of
		// waiting for the next accessor call)
		if (getOwner()) {
			createRenderEffect(() => {
				const key = keyAccessor();
				const count = usage.get(key) ?? 0;
				usage.set(key, count + 1);
				onCleanup(() => {
					const count = usage.get(key) ?? 0;
					if (count > 1) {
						usage.set(key, count - 1);
					} else {
						usage.delete(key);
					}
				});
			});
		}

		return [
			accessor,
			{
				refetch,
				mutate: mutate as ResourceReturn<TResource, TInfo>[1]['mutate'],
				fetch,
			},
		] as const;
	}

	useResource.clear = () => getResourceForKey.cache.clear();
	useResource.markAsStale = markAsStale;

	useResourceContext().add(useResource);

	return useResource;
}
