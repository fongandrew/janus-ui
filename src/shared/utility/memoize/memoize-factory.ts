export interface Cache<TKey, TValue> {
	has(key: TKey): boolean;
	get(key: TKey): TValue;
	set(key: TKey, value: TValue): void;
}

export interface MemoizedFunction<
	TArgs extends unknown[],
	TReturn,
	TKey,
	TCache extends Cache<TKey, any>,
> {
	(...args: TArgs): TReturn;
	resolve: (...args: TArgs) => TKey;
	cache: TCache;
}

export type Memoizer<
	TResolverArgs extends unknown[],
	TKey,
	TCache extends Cache<TKey, any>,
	TOpts = void,
> = <TArgs extends TResolverArgs, TReturn>(
	func: (...args: TArgs) => TReturn,
	opts?: TOpts,
) => MemoizedFunction<TArgs, TReturn, TKey, TCache>;

/**
 * Base function for creating alternatives to Ldoash's memoize.
 */
export function memoizeFactory<
	TResolverArgs extends unknown[],
	TKey,
	TCache extends Cache<TKey, any>,
	TResolverOpts,
>(
	resolver: (...args: TResolverArgs) => TKey,
	createCache: (opts?: TResolverOpts) => TCache,
): Memoizer<TResolverArgs, TKey, TCache, TResolverOpts> {
	return function memoize<TArgs extends TResolverArgs, TReturn, TOpts extends TResolverOpts>(
		func: (...args: TArgs) => TReturn,
		opts?: TOpts,
	): MemoizedFunction<TArgs, TReturn, TKey, TCache> {
		function memoized(...args: TArgs): TReturn {
			const key = resolver(...args);
			if (memoized.cache.has(key)) {
				return memoized.cache.get(key);
			}
			const result = func(...args);
			memoized.cache.set(key, result);
			return result;
		}

		memoized.resolve = resolver;
		memoized.cache = createCache(opts);

		return memoized;
	};
}
