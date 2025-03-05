import { combine } from '~/shared/utility/iterators';

describe('combine', () => {
	function* generator1() {
		yield 1;
		yield 2;
		yield 3;
	}

	function* generator2() {
		yield 4;
		yield 5;
		yield 6;
	}

	const array1 = [1, 2, 3];
	const array2 = [4, 5, 6];
	const array3 = [7, 8, 9];

	it('should combine multiple arrays', () => {
		const combined = [...combine(array1, array2, array3)];
		expect(combined).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('should handle empty iterators', () => {
		const combined = [...combine([], array1, [])];
		expect(combined).toEqual([1, 2, 3]);
	});

	it('should combine generator functions', () => {
		const combined = [...combine(generator1(), generator2())];
		expect(combined).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('should handle mixed arrays and generators', () => {
		const array = [7, 8, 9];
		const combined = [...combine(generator1(), array, generator2())];
		expect(combined).toEqual([1, 2, 3, 7, 8, 9, 4, 5, 6]);
	});
});
