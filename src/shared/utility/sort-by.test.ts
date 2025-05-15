import { describe, expect, it } from 'vitest';

import { sortBy } from '~/shared/utility/sort-by';

describe('sortBy', () => {
	it('sorts an array of objects by a numeric property', () => {
		const array = [
			{ id: 3, name: 'Alice' },
			{ id: 1, name: 'Charlie' },
			{ id: 2, name: 'Bob' },
		];

		const result = sortBy(array, (item) => item.id);
		expect(result).toEqual([
			{ id: 1, name: 'Charlie' },
			{ id: 2, name: 'Bob' },
			{ id: 3, name: 'Alice' },
		]);

		// Verify it sorts in-place
		expect(result).toBe(array);
	});

	it('sorts an array of objects by a string property', () => {
		const array = [
			{ id: 3, name: 'Alice' },
			{ id: 1, name: 'Charlie' },
			{ id: 2, name: 'Bob' },
		];

		sortBy(array, (item) => item.name);
		expect(array).toEqual([
			{ id: 3, name: 'Alice' },
			{ id: 2, name: 'Bob' },
			{ id: 1, name: 'Charlie' },
		]);
	});
});
