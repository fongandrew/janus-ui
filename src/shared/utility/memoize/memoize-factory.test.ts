import { memoizeFactory } from '~/shared/utility/memoize/memoize-factory';

describe('memoizeFactory', () => {
	it('should memoize a custom key', () => {
		const resolver = (a: number, b: number) => a + b;
		const createCache = () => new Map<number, number>();

		const memoize = memoizeFactory(resolver, createCache);

		const addRandom = (a: number, b: number) => a + b + Math.random();
		const memoizedAddRom = memoize(addRandom);

		expect(memoizedAddRom(1, 2)).toEqual(memoizedAddRom(2, 1));
		expect(memoizedAddRom(2, 2)).not.toEqual(memoizedAddRom(2, 1));
	});

	it('should memoize a function with a custom cache per memoized function', () => {
		const resolver = (a: number) => a;
		const createCache = () =>
			Object.assign(new Map<number, number>(), {
				foo: () => 'bar',
			});

		const memoize = memoizeFactory(resolver, createCache);

		const addRandom = (a: number) => a + Math.random();
		const memoizedAddRandomA = memoize(addRandom);
		const memoizedAddRandomB = memoize(addRandom);

		expect(memoizedAddRandomA(1)).toEqual(memoizedAddRandomA(1));
		expect(memoizedAddRandomB(1)).not.toEqual(memoizedAddRandomA(1));
		expect(memoizedAddRandomA.cache.foo()).toEqual('bar');
		expect(memoizedAddRandomB.cache.foo()).toEqual('bar');
	});
});
