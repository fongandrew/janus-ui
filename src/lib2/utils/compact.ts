export type OmitUndefined<T> = {
	[K in keyof T]: undefined extends T[K] ? never : T[K];
};

/**
 * A utility function that removes all undefined properties from the target object
 */
export function compact<T extends object>(target: T): OmitUndefined<T> {
	const result = {} as T;
	for (const key in target) {
		const value = target[key];
		if (typeof value !== 'undefined') {
			result[key] = value;
		}
	}
	return result as OmitUndefined<T>;
}
