/**
 * Utility for uniqueish strings we don't want to conflict with other attributes
 */

/**
 * Simple util for creating a property name
 */
export function prop<T extends string>(name: T) {
	return `$$${name}` as const;
}

/**
 * Create a custom event name
 */
export function evt<T extends string>(name: T) {
	return `evt-${name}` as const;
}
