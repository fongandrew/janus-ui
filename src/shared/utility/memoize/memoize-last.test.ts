import { describe, expect, it, vi } from 'vitest';

import { memoizeLast } from '~/shared/utility/memoize/memoize-last';

describe('memoizeLast', () => {
	it('should return the same result for the same arguments', () => {
		const func = vi.fn((a: number, b: number) => a + b);
		const memoizedFunc = memoizeLast(func);

		const result1 = memoizedFunc(1, 2);
		const result2 = memoizedFunc(1, 2);

		expect(result1).toBe(3);
		expect(result2).toBe(3);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should return a new result for different arguments', () => {
		const func = vi.fn((a: number, b: number) => a + b);
		const memoizedFunc = memoizeLast(func);

		const result1 = memoizedFunc(1, 2);
		const result2 = memoizedFunc(2, 3);

		expect(result1).toBe(3);
		expect(result2).toBe(5);
		expect(func).toHaveBeenCalledTimes(2);
	});

	it('should handle referential equality for objects', () => {
		const func = vi.fn((obj: { value: number }) => obj.value);
		const memoizedFunc = memoizeLast(func);

		const obj = { value: 10 };
		const result1 = memoizedFunc(obj);
		const result2 = memoizedFunc(obj);

		expect(result1).toBe(10);
		expect(result2).toBe(10);
		expect(func).toHaveBeenCalledTimes(1);

		const newObj = { value: 10 };
		const result3 = memoizedFunc(newObj);

		expect(result3).toBe(10);
		expect(func).toHaveBeenCalledTimes(2);
	});

	it('should work with no args', () => {
		const func = vi.fn(() => 10);
		const memoizedFunc = memoizeLast(func);

		const result1 = memoizedFunc();
		const result2 = memoizedFunc();

		expect(result1).toBe(10);
		expect(result2).toBe(10);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should work with variable numbers of args', () => {
		const func = vi.fn((...args: number[]) => args.reduce((a, b) => a + b, 0));
		const memoizedFunc = memoizeLast(func);

		expect(memoizedFunc(1, 2, 3)).toBe(6);
		expect(memoizedFunc(1, 2)).toBe(3);
		expect(memoizedFunc(1, 2, 4)).toBe(7);
	});
});
