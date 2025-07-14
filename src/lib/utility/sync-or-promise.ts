/**
 * Takes something that may or may not be a promise and returns the result of a callback
 * as sync (if thing is not a promise) or async (if thing is a promise).
 */
export function syncOrPromise<TIn, TOut>(
	thing: TIn | Promise<TIn>,
	callback: (value: TIn) => TOut | Promise<TOut>,
): TOut | Promise<TOut> {
	if (thing instanceof Promise) {
		return thing.then(callback);
	}
	return callback(thing);
}
