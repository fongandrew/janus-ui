/**
 * Inspired by bound event handlers in SolidJS: This is a utility for using tuples to pass
 * around versions of callbacks that are bound to a specific set of arguments without
 * having to call .bind or introduce new closures. It is a generic version of Solid's
 * boudn handlers.
 */
export type BoundCallback<TReturn, TArgs extends any[], TData> = [
	(...args: [TData, ...TArgs]) => TReturn,
	TData,
];

/**
 * Union for what could be a bound callback or a regular callback
 */
export type BoundCallbackUnion<TReturn, TArgs extends any[]> =
	| ((...args: TArgs) => TReturn)
	| BoundCallback<TReturn, TArgs, any>;

/**
 * Typing bound callback is a bit awkward because it's usually assigned to a BoundCallbackUnion
 * that doesn't care about the type of the data property. This utility creates the tuple
 * and ensures the data matches the callback param.
 */
export function bindCallback<TReturn, TArgs extends any[], TData>(
	callback: (...args: [TData, ...TArgs]) => TReturn,
	data: TData,
): BoundCallback<TReturn, TArgs, TData> {
	return [callback, data];
}

/**
 * Given a bound callback union, execute it with the data and args
 */
export function callBound<TReturn, TArgs extends any[]>(
	callback: BoundCallbackUnion<TReturn, TArgs>,
	...args: TArgs
): TReturn;
export function callBound<TReturn, TArgs extends any[]>(
	callback: BoundCallbackUnion<TReturn, TArgs> | undefined,
	...args: TArgs
): TReturn | undefined;
export function callBound<TReturn, TArgs extends any[]>(
	callback: BoundCallbackUnion<TReturn, TArgs> | undefined,
	...args: TArgs
): TReturn | undefined {
	if (Array.isArray(callback)) {
		return callback[0](callback[1], ...args);
	}
	return callback?.(...args);
}
