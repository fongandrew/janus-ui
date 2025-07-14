import { describe, expect, it } from 'vitest';

import { pull, pullLast } from '~/lib/utility/list';

describe('pull', () => {
	it('should remove the first instance of item from the array if it exists', () => {
		const arr = [1, 2, 3, 4, 3];
		pull(arr, 3);
		expect(arr).toEqual([1, 2, 4, 3]);
	});

	it('should not modify the array if the item does not exist', () => {
		const arr = [1, 2, 3, 4];
		pull(arr, 5);
		expect(arr).toEqual([1, 2, 3, 4]);
	});
});

describe('pullLast', () => {
	it('should remove the first instance of item from the array if it exists', () => {
		const arr = [1, 2, 3, 4, 3];
		pullLast(arr, 3);
		expect(arr).toEqual([1, 2, 3, 4]);
	});

	it('should not modify the array if the item does not exist', () => {
		const arr = [1, 2, 3, 4];
		pullLast(arr, 5);
		expect(arr).toEqual([1, 2, 3, 4]);
	});
});
