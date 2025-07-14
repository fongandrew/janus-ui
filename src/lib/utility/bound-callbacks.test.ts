import { describe, expect, it } from 'vitest';

import { bindCallback, callBound } from '~/lib/utility/bound-callbacks';

describe('bindCallback', () => {
	it('should bind data to the callback', () => {
		const callback = (data: string, num: number) => `${data} ${num}`;
		const bound = bindCallback(callback, 'test');
		expect(bound).toEqual([callback, 'test']);
	});

	// eslint-disable-next-line vitest/expect-expect
	it('should catch type errors', () => {
		// @ts-expect-error: Data doesn't match
		bindCallback((data: string, num: number) => `${data} ${num}`, 42);
	});
});

describe('callBound', () => {
	it('should call a bound callback with the correct arguments', () => {
		const callback = (data: string, num: number) => `${data} ${num}`;
		const bound = bindCallback(callback, 'test');
		const result = callBound(bound, 42);
		expect(result).toBe('test 42');
	});

	it('should call a regular callback with the correct arguments', () => {
		const callback = (num: number) => num * 2;
		const result = callBound(callback, 21) satisfies number;
		expect(result).toBe(42);
	});

	it('should return undefined if the regular callback is undefined', () => {
		const callback = undefined as ((num: number) => string) | undefined;
		const result = callBound(callback, 21) satisfies string | undefined;
		expect(result).toBeUndefined();
	});
});
