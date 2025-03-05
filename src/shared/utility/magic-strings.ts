/**
 * Utility for uniqueish strings we don't want to conflict with other attributes
 */
// let prefix = 'sb-';
const prefix = '' as const;

/**
 * Simple util for creating data attributes with a changeable prefix
 */
export function data<T extends string>(name: T) {
	return `data-${prefix}${name}` as const;
}

/**
 * Simple util for creating a property name
 */
export function prop<T extends string>(name: T) {
	return `$$${prefix}${name}` as const;
}

/**
 * Create a custom event name
 */
export function evt<T extends string>(name: T) {
	return `${prefix}${name}` as const;
}
