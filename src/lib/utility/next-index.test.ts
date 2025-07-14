import { describe, expect, it } from 'vitest';

import { nextIndex } from '~/lib/utility/next-index';

describe('nextIndex', () => {
	const items = ['item1', 'item2', 'item3', 'item4'];

	it('should return the next index without wrapping', () => {
		expect(nextIndex(items, 1, 1)).toBe(2);
		expect(nextIndex(items, 2, 1)).toBe(3);
		expect(nextIndex(items, 2, -1)).toBe(1);

		// Should not exceed the last index
		expect(nextIndex(items, 3, 1)).toBe(3);

		// Should not go below the first index
		expect(nextIndex(items, 0, -1)).toBe(0);
	});

	it('should return the next index with wrapping', () => {
		expect(nextIndex(items, 1, 1, true)).toBe(2);
		// Should wrap to the first index
		expect(nextIndex(items, 3, 1, true)).toBe(0);
		// Should wrap to the last index
		expect(nextIndex(items, 0, -1, true)).toBe(3);
	});

	it('should handle negative current index', () => {
		expect(nextIndex(items, -1, 1)).toBe(0);
		expect(nextIndex(items, -1, -1)).toBe(3);
	});
});
