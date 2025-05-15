/**
 * Sorts an array in place by a predicate function.
 */
export function sortBy<T>(array: T[], predicate: ((val: T) => string) | ((val: T) => number)): T[] {
	array.sort((a, b) => {
		const aValue = predicate(a);
		const bValue = predicate(b);
		if (aValue < bValue) {
			return -1;
		}
		if (aValue > bValue) {
			return 1;
		}
		return 0;
	});
	return array;
}
