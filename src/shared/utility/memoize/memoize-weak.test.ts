import { describe, expect, it } from 'vitest';

import { memoizeWeak } from '~/shared/utility/memoize/memoize-weak';

describe('memoizeWeak', () => {
	const addFooBarRandom = (foo: { bar: number }) => foo.bar + Math.random();
	const memoizedAddFooBarRandom = memoizeWeak(addFooBarRandom);

	it('should memoize a single argument function based on referential equality', () => {
		const foo = { bar: 1 };
		expect(memoizedAddFooBarRandom(foo)).toEqual(memoizedAddFooBarRandom(foo));
		expect(memoizedAddFooBarRandom({ bar: 1 })).not.toEqual(memoizedAddFooBarRandom(foo));
	});
});
