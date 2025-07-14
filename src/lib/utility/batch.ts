import { createDeferred, type Deferred } from '~/lib/utility/deferred';

/**
 * Creates a batcher function that batches multiple key requests into a single call
 */
export function createBatcher<TKey, TResult>(
	fetcher: (keys: TKey[]) => Promise<TResult[]>,
	opts?: { timeout?: number },
): (key: TKey) => Promise<TResult> {
	const cache = new Map<TKey, Deferred<TResult>>();
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	async function batchFetch(key: TKey): Promise<TResult> {
		const cached = cache.get(key);
		if (cached) return cached;

		const deferred = createDeferred<TResult>();
		cache.set(key, deferred);
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(async () => {
			timeoutId = null;
			const keys = Array.from(cache.keys());
			try {
				const results = await fetcher(keys);
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i]!;
					cache.get(key as TKey)?.resolve(results[i]!);
					cache.delete(key as TKey);
				}
			} catch (e) {
				for (const key of keys) {
					cache.get(key as TKey)?.reject(e as Error);
					cache.delete(key as TKey);
				}
			}
		}, opts?.timeout ?? 0);
		return deferred;
	}

	return batchFetch;
}
