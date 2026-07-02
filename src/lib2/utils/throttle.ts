/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * The throttled function comes with a cancel method to cancel delayed invocations
 * and a flush method to immediately invoke them.
 *
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @param options The options object
 * @param options.leading Specify invoking on the leading edge of the timeout (default: true)
 * @param options.trailing Specify invoking on the trailing edge of the timeout (default: true)
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
	options: { leading?: boolean; trailing?: boolean } = {},
): T & { cancel: () => void; flush: () => void } {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: Parameters<T> | undefined;
	let lastCallTime: number | undefined;
	let result: ReturnType<T>;

	const leading = options.leading !== false;
	const trailing = options.trailing !== false;

	function invokeFunc(thisArg: unknown, args: Parameters<T>) {
		lastCallTime = Date.now();
		result = func.apply(thisArg, args);
		return result;
	}

	function shouldInvoke(time: number) {
		if (lastCallTime === undefined) {
			return true;
		}
		const timeSinceLastCall = time - lastCallTime;
		return timeSinceLastCall >= wait;
	}

	function trailingEdge(thisArg: unknown) {
		timeoutId = undefined;
		if (trailing && lastArgs) {
			return invokeFunc(thisArg, lastArgs);
		}
		lastArgs = undefined;
		return result;
	}

	function cancel() {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}
		lastArgs = timeoutId = undefined;
		lastCallTime = undefined;
	}

	function flush(this: unknown) {
		return timeoutId === undefined ? result : trailingEdge(this);
	}

	function throttled(this: unknown, ...args: Parameters<T>): ReturnType<T> {
		const time = Date.now();
		const isInvoking = shouldInvoke(time);

		lastArgs = args;

		if (isInvoking) {
			if (timeoutId === undefined) {
				lastCallTime = time;
				if (leading) {
					return invokeFunc(this, args);
				}
			}
			if (timeoutId === undefined) {
				timeoutId = setTimeout(() => trailingEdge(this), wait);
			}
			return result;
		}

		if (timeoutId === undefined && trailing) {
			timeoutId = setTimeout(() => trailingEdge(this), wait);
		}
		return result;
	}

	throttled.cancel = cancel;
	throttled.flush = flush;

	return throttled as unknown as T & { cancel: () => void; flush: () => void };
}
