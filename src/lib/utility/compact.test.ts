import { describe, expect, it } from 'vitest';

import { compact } from '~/lib/utility/compact';

describe('compact', () => {
	it('should remove undefined properties from object', () => {
		const input = {
			a: 1,
			b: undefined,
			c: 'test',
			d: undefined,
			e: null,
			f: 0,
		};

		const result = compact(input);
		expect(result).toEqual({
			a: 1,
			c: 'test',
			e: null,
			f: 0,
		});
	});

	it('should return empty object when all properties are undefined', () => {
		const input = {
			a: undefined,
			b: undefined,
		};

		const result = compact(input);
		expect(result).toEqual({});
	});

	it('types object without undefined properties', () => {
		const input = {
			a: 1,
			b: undefined,
			c: 2,
		};
		const result = compact(input) satisfies {
			a?: number;
			b?: number;
			c?: number;
		};

		// Test access
		expect(result.a).toBe(1);
		expect(result.b).toBeUndefined();
		expect(result.c).toBe(2);
	});
});
