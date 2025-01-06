import { LRUCache } from '~/shared/utility/lru-cache';
import { memoizeFactory } from '~/shared/utility/memoize/memoize-factory';

const DEFAULT_CAPACITY = 10;

/**
 * Memoizer that takes multiple scalar values and stringifies them
 * to get a cache key
 */
export const memoizeLRUMultiArg = memoizeFactory(
	(...args: (string | number | boolean | null | undefined)[]): string => JSON.stringify(args),
	(opts: { capacity?: number } = {}) =>
		new LRUCache<string, any>(opts.capacity ?? DEFAULT_CAPACITY),
);

/** Simple memoizer that accepts a single arg */
export const memoizeLRUSingleArg = memoizeFactory(
	(arg: any): any => arg,
	(opts: { capacity?: number } = {}) =>
		new LRUCache<string, any>(opts.capacity ?? DEFAULT_CAPACITY),
);
