import { describe, expect, it } from 'vitest';

import { memoizeOne } from '~/shared/utility/memoize/memoize-one';

describe('memoizeOne', () => {
	it('should memoize a function with no argument', () => {
		const memRand1 = memoizeOne(Math.random);
		const memRand2 = memoizeOne(Math.random);

		expect(memRand1()).toBe(memRand1());
		expect(memRand2()).toBe(memRand2());
		expect(memRand1()).not.toBe(memRand2());
	});
});
