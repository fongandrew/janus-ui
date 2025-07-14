import { describe, expect, it } from 'vitest';

import { findLastIndex } from '~/lib/utility/find-last-index';

describe('findLastIndex', () => {
	it('should find the last index of an item that matches the predicate', () => {
		const array = [1, 2, 3, 4, 5];
		const result = findLastIndex(array, (item) => item > 3);

		expect(result).toBe(4); // Index of 5, which is the last item > 3
	});

	it('should find the last occurrence when multiple items match', () => {
		const array = [1, 2, 3, 2, 1];
		const result = findLastIndex(array, (item) => item === 2);

		expect(result).toBe(3); // Index of the second 2
	});

	it('should return -1 when no items match the predicate', () => {
		const array = [1, 2, 3, 4, 5];
		const result = findLastIndex(array, (item) => item > 10);

		expect(result).toBe(-1);
	});

	it('should return -1 for an empty array', () => {
		const array: number[] = [];
		const result = findLastIndex(array, (item) => item > 0);

		expect(result).toBe(-1);
	});
});
