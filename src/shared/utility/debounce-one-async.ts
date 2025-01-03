/**
 * Given an async callback function, debounce so that only one call is
 * running at a time. If a call is already running, the next call will
 * just return the promise of the running call.
 */
export function debounceOneAsync<TReturn>(
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
