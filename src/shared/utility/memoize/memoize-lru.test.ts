import { memoizeLRUMultiArg, memoizeLRUSingleArg } from '~/shared/utility/memoize/memoize-lru';

describe('memoizeLRUSingleArg', () => {
	it('should memoize a single argument function', () => {
		const addRandom = (a: number) => a + Math.random();
		const memoizedAddRandom = memoizeLRUSingleArg(addRandom);

		expect(memoizedAddRandom(1)).toEqual(memoizedAddRandom(1));
		expect(memoizedAddRandom(2)).not.toEqual(memoizedAddRandom(1));
	});

	it('supports custom cache size', () => {
		const addRandom = (a: number) => a + Math.random();
		const memoizedAddRandom = memoizeLRUSingleArg(addRandom, {
			capacity: 2,
		});

		const first = memoizedAddRandom(1);
		expect(memoizedAddRandom(1)).toEqual(first);
		expect(memoizedAddRandom(2)).not.toEqual(first);
		expect(memoizedAddRandom(3)).not.toEqual(first);
		expect(memoizedAddRandom(1)).not.toEqual(first);
	});
});

describe('memoizeLRUMultiArg', () => {
	it('should memoize a multiple argument function', () => {
		const addRandom = (a: number, b: number) => a + b + Math.random();
		const memoizedAddRandom = memoizeLRUMultiArg(addRandom);

		expect(memoizedAddRandom(1, 2)).toEqual(memoizedAddRandom(1, 2));
		expect(memoizedAddRandom(2, 2)).not.toEqual(memoizedAddRandom(2, 1));
	});

	it('supports custom cache size', () => {
		const addRandom = (a: number, b: number) => a + b + Math.random();
		const memoizedAddRandom = memoizeLRUMultiArg(addRandom);

		const first = memoizedAddRandom(1, 2);
		expect(memoizedAddRandom(1, 2)).toEqual(first);
		expect(memoizedAddRandom(1, 3)).not.toEqual(first);
		expect(memoizedAddRandom(1, 4)).not.toEqual(first);
		expect(memoizedAddRandom(1, 2)).not.toEqual(first);
	});
});
