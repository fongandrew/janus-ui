import { describe, expect, it, vi } from 'vitest';

import { randInt } from '~/lib/utility/random';

describe('randInt', () => {
	it('should return the minimum value when Math.random returns 0', () => {
		vi.spyOn(Math, 'random').mockImplementationOnce(() => 0);
		expect(randInt(5, 10)).toBe(5);
	});

	it('should return the minimum value when Math.random returns near 0', () => {
		vi.spyOn(Math, 'random').mockImplementationOnce(() => 0.001);
		expect(randInt(5, 10)).toBe(5);
	});

	it('should return the maximum value when Math.random returns near 1', () => {
		vi.spyOn(Math, 'random').mockImplementationOnce(() => 0.999);
		expect(randInt(5, 10)).toBe(10);
	});
});
