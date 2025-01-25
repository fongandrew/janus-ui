import { step } from '~/shared/utility/step';

describe('step', () => {
	it('rounds to nearest step', () => {
		expect(step(0, 100, 10, 4)).toBe(0);
		expect(step(0, 100, 10, 5)).toBe(10);
		expect(step(0, 100, 10, 14)).toBe(10);
		expect(step(0, 100, 10, 15)).toBe(20);
	});

	it('does not go below min', () => {
		expect(step(0, 100, 10, -1)).toBe(0);
		expect(step(0, 100, 10, -10)).toBe(0);
	});

	it('does not go above max', () => {
		expect(step(0, 100, 10, 101)).toBe(100);
		expect(step(0, 100, 10, 110)).toBe(100);
	});
});
