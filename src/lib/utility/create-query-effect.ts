export interface QueryEffectOpts {
	/** Debounce period in milliseconds */
	debounceMs?: number;
	/**
	 * Catch abort from debounce? Defaults to true to avoid unnecessary unhandled
	 * rejection warnings but can set to false to handle aborts in the caller.
	 */
	catchAbort?: boolean;
}

const DEFAULT_OPTS: Required<QueryEffectOpts> = {
	debounceMs: 120,
	catchAbort: true,
};

/**
 * Creates a query function that debounces requests and aborts previous requests if
 * a new request is made before the previous one completes.
 */
export function createQueryEffect<TQuery, TData>(
	fetcher: (query: TQuery, abortSignal: AbortSignal) => Promise<TData>,
	onFetched: (data: TData) => void,
	opts: QueryEffectOpts & { catchAbort: true },
): (query: TQuery) => Promise<TData>;
export function createQueryEffect<TQuery, TData>(
	fetcher: (query: TQuery, abortSignal: AbortSignal) => Promise<TData>,
	onFetched: (data: TData) => void,
	opts?: QueryEffectOpts,
): (query: TQuery) => Promise<TData | undefined>;
export function createQueryEffect<TQuery, TData>(
	fetcher: (query: TQuery, abortSignal: AbortSignal) => Promise<TData>,
	opts: QueryEffectOpts & { catchAbort: true },
): (query: TQuery) => Promise<TData>;
export function createQueryEffect<TQuery, TData>(
	fetcher: (query: TQuery, abortSignal: AbortSignal) => Promise<TData>,
	opts?: QueryEffectOpts,
): (query: TQuery) => Promise<TData | undefined>;
export function createQueryEffect<TQuery, TData>(
	fetcher: (query: TQuery, abortSignal: AbortSignal) => Promise<TData>,
	onFetchedOrOpts?: ((data: TData) => void) | QueryEffectOpts,
	opts?: QueryEffectOpts,
): (query: TQuery) => Promise<TData | undefined> {
	let onFetched: ((data: TData) => void) | undefined;
	if (typeof onFetchedOrOpts === 'function') {
		onFetched = onFetchedOrOpts;
	} else {
		opts = onFetchedOrOpts;
	}

	const optsWithDefaults = { ...DEFAULT_OPTS, ...opts };
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let abortController: AbortController | null = null;

	return async (query: TQuery) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();
		const { signal } = abortController;

		try {
			return await new Promise<TData>((resolve, reject) => {
				timeoutId = setTimeout(async () => {
					try {
						const data = await fetcher(query, signal);
						if (signal.aborted) {
							throw signal.reason;
						}
						onFetched?.(data);
						resolve(data);
					} catch (error) {
						reject(error);
					}
				}, optsWithDefaults.debounceMs);

				signal.addEventListener('abort', () => {
					reject(signal.reason);
				});
			});
		} catch (err) {
			if (optsWithDefaults.catchAbort && (err as Error).name === 'AbortError') {
				return undefined;
			}
			throw err;
		}
	};
}
