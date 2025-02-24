/**
 * Utility for uniqueish strings we don't want to conflict with other attributes
 */
let prefix = 'sb';

/**
 * Change prefix used by our strings
 */
export function setPrefix(value: string) {
	prefix = value;
}

/**
 * Simple util for creating data attributes with a changeable prefix
 */
export function data(name: string) {
	return `data-${prefix}-${name}`;
}

/**
 * Simple util for creating a property name
 */
export function prop(name: string) {
	return `$$${prefix}-${name}`;
}
