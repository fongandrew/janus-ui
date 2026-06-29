import { describe, expect, it } from 'vitest';

import { ariaize, attrs } from '~/lib2/solid/aria';

describe('ariaize', () => {
	it('maps disabled to aria-disabled, never native disabled', () => {
		const out = ariaize({ disabled: true });
		expect(out).toEqual({ 'aria-disabled': true });
		expect('disabled' in out).toBe(false);
	});

	it('maps required and invalid', () => {
		expect(ariaize({ required: true, invalid: true })).toEqual({
			'aria-required': true,
			'aria-invalid': true,
		});
	});

	it('omits falsy values', () => {
		expect(ariaize({ disabled: false, required: undefined })).toEqual({});
	});
});

describe('attrs', () => {
	it('joins truthy parts with a space', () => {
		expect(attrs('foo', undefined, 'bar')).toBe('foo bar');
	});

	it('returns undefined when nothing is left', () => {
		expect(attrs(undefined, false, null)).toBeUndefined();
		expect(attrs(undefined)).toBeUndefined();
	});
});
