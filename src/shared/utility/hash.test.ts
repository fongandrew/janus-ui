import { describe, expect, it } from 'vitest';

import { djb2Base36 } from '~/shared/utility/hash';

describe('djb2Base36', () => {
	it('should return a consistent hash for the same input', () => {
		expect(djb2Base36('hello')).toBe(djb2Base36('hello'));
		expect(djb2Base36('world')).toBe(djb2Base36('world'));
	});

	it('should return different hashes for different inputs', () => {
		expect(djb2Base36('hello')).not.toBe(djb2Base36('world'));
		expect(djb2Base36('a')).not.toBe(djb2Base36('b'));
	});

	it('should handle empty strings', () => {
		expect(djb2Base36('')).toMatch(/^[0-9a-z]+$/);
	});

	it('should handle special characters', () => {
		expect(typeof djb2Base36('!@#$%^&*()')).toBe('string');
		expect(djb2Base36('!@#$%^&*()')).toBe(djb2Base36('!@#$%^&*()'));
	});

	it('should return base-36 strings (only containing 0-9 and a-z)', () => {
		const hash = djb2Base36('test string');
		expect(hash).toMatch(/^[0-9a-z]+$/);
	});
});
