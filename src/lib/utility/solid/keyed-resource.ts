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
 *
 * **Divergence from stock Solid `Resource<T>`:** the call accessor (`data()`)
 * returns `data.latest` semantics, not `data()`'s. Stock Solid's `read()`
 * increments the surrounding `<Suspense>` pending counter whenever there's an
 * in-flight refetch promise — so any `markAsStale → refetch` would swap the
 * Suspense fallback in for the rendered children even though the prior cached
 * value is still available, causing a flash on every external update. This
 * accessor reads `latest`, which on first load falls through to `read()` (so
 * the initial spinner still shows) but on subsequent refetches just returns
 * the prior value without poking Suspense. Consumers that genuinely want a
 * spinner during refetch should drive UX off `data.loading` /
 * `data.state === 'refreshing'` directly.
 */
export function createKeyedResource<TResource, TKey, TInfo = unknown>(
	fetcher: (key: TKey) => Promise<TResource>,
	opts?: { capacity?: number },
) {
	const getResourceFromLRU = memoizeLRUSingleArg((key: TKey) => {
		const [data, setters] = createResource(() => fetcher(key));
		return [Object.assign(data, { stale: false }), setters] as const;
	}, opts);

	/** Track component usage so we know when to trigger refetch if marked as stale */
	const usage = new Map<TKey, number>();

	/**
	 * Active usage cache - stores resources that currently have active subscribers.
	 * This prevents resources from being evicted from the LRU cache while they're still in use.
	 * Resources are added when usage goes from 0 -> 1 and removed when usage goes from 1 -> 0.
	 */
	const activeResources = new Map<TKey, ReturnType<typeof getResourceFromLRU>>();

	/**
	 * Get resource for a key, checking active cache first, then LRU cache.
	 * This ensures actively-used resources are never lost even if evicted from LRU.
	 */
	const getResourceForKey = (key: TKey) => {
		// Check active cache first for currently-used resources
		const active = activeResources.get(key);
		if (active) return active;
		// Fall back to LRU cache (may create new resource if not cached)
		return getResourceFromLRU(key);
	};

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
		// Check if resource exists in either active cache or LRU cache
		const resolvedKey = getResourceFromLRU.resolve(key);
		if (!activeResources.has(key) && !getResourceFromLRU.cache.has(resolvedKey)) return;
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
			// `latest` instead of `data()` — see the factory's docstring for
			// the rationale. tl;dr: stock `read()` poking Suspense on every
			// refetch flashes the fallback even though the cached value is
			// still available; `latest` returns the prior value without
			// touching the suspense counter, while still falling through to
			// `read()` on first load.
			return data.latest;
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

				// Add to active cache when usage goes from 0 -> 1
				if (count === 0) {
					activeResources.set(key, getResourceFromLRU(key));
				}

				onCleanup(() => {
					const count = usage.get(key) ?? 0;
					if (count > 1) {
						usage.set(key, count - 1);
					} else {
						usage.delete(key);
						// Remove from active cache when usage goes from 1 -> 0
						activeResources.delete(key);
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

	/** Mark all active resources as stale and trigger refetches */
	async function markAllAsStale() {
		const promises: Promise<unknown>[] = [];
		for (const key of activeResources.keys()) {
			promises.push(markAsStale(key));
		}
		await Promise.all(promises);
	}

	useResource.clear = () => getResourceFromLRU.cache.clear();
	useResource.markAsStale = markAsStale;
	useResource.markAllAsStale = markAllAsStale;

	useResourceContext().add(useResource);

	return useResource;
}
