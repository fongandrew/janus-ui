import { createDeferred, type Deferred } from '~/shared/utility/deferred';

/**
 * Given an async callback function, debounce so that only one call is
 * running at a time. If a call is already running, the next call will
 * just return the promise of the running call.
 */
export function debouncePrevAsync<TReturn>(
	callback: () => Promise<TReturn>,
): () => Promise<TReturn> {
	let running: Promise<TReturn> | null = null;
	return async (): Promise<TReturn> => {
		if (running) {
			return running;
		}
		running = callback();
		try {
			return await running;
		} finally {
			running = null;
		}
	};
}

/**
 * Debounces an async function by consolidating all calls within a timeout window
 * into a single call. Waits for any previously running calls to complete before
 * executing the next one.
 *
 * @param callback The async function to debounce
 * @param waitMs The timeout duration in milliseconds (default: 0)
 * @returns A debounced version of the callback function
 */
export function debounceNextAsync<TReturn>(
	callback: () => Promise<TReturn>,
	waitMs = 0,
): () => Promise<TReturn> {
	/** Promise tracking when callback is actually running, null otherwise */
	let callbackPromise: Promise<TReturn> | null = null;
	/** Promise for the next time the debounced callback is called */
	let nextPromise: Promise<TReturn> | null = null;
	/**
	 * Promise / deferred for timeout before calling callback (will run concurrently
	 * for any pending callback to resolve.
	 */
	let timeoutPromise: Deferred<void> | null = null;
	/** Pending timeout ID for timeout that resolves timeoutPromise */
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	async function runCallback() {
		nextPromise = null;
		callbackPromise = callback();
		try {
			return await callbackPromise;
		} finally {
			callbackPromise = null;
		}
	}

	async function onTimeout() {
		timeoutPromise?.resolve();
		timeoutPromise = null;
		timeoutId = null;
	}

	return async (): Promise<TReturn> => {
		timeoutPromise ??= createDeferred<void>();
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(onTimeout, waitMs);

		nextPromise ??= Promise.allSettled([timeoutPromise, callbackPromise]).then(runCallback);
		return nextPromise;
	};
}
