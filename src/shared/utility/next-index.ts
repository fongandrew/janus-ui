/**
 * Utility for cycling through an array of menu-item like things. Returns the index of the
 * next item, with optional wrapping.
 */
export function nextIndex<T>(items: T[], current: number, incr = 1, wrap = false): number {
	if (current < 0) {
		return incr >= 0 ? 0 : items.length - 1;
	}
	return wrap
		? (current + incr + items.length) % items.length
		: Math.min(Math.max(current + incr, 0), items.length - 1);
}
