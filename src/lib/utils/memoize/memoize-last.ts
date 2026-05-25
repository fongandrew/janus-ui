/**
 * Memoizer that memoizes the last result and returns it for all future calls but only if
 * params are the same (referentially equal)
 */
export function memoizeLast<TArgs extends unknown[], TResult>(func: (...args: TArgs) => TResult) {
	let lastArgs: TArgs | undefined;
	let lastResult: TResult | undefined;
	return function memoized(...args: TArgs) {
		if (
			lastArgs &&
			lastArgs.length === args.length &&
			args.every((arg, i) => arg === lastArgs?.[i])
		) {
			return lastResult!;
		}
		lastArgs = args;
		lastResult = func(...args);
		return lastResult;
	};
}
