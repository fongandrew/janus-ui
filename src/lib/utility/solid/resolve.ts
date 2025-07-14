// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function resolveAccessor<T>(value: T extends Function ? never : T | (() => T)): T {
	if (typeof value === 'function') {
		return value();
	}
	return value as T;
}
