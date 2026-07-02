import { describe, expect, it } from 'vitest';

import { ariaize, attrs } from '~/lib2/solid/aria';

describe('ariaize', () => {
	it('maps disabled to aria-disabled, never native disabled', () => {
		const out = ariaize({ disabled: true });
		expect(out).toEqual({ 'aria-disabled': 'true' });
		expect('disabled' in out).toBe(false);
	});

	it('maps required and invalid to their aria attributes', () => {
		expect(ariaize({ required: true })).toEqual({ 'aria-required': 'true' });
		expect(ariaize({ invalid: true })).toEqual({ 'aria-invalid': 'true' });
	});

	it('emits nothing for falsy flags', () => {
		expect(ariaize({})).toEqual({});
		expect(ariaize({ disabled: false, required: false, invalid: undefined })).toEqual({});
	});

	it('combines multiple flags', () => {
		expect(ariaize({ disabled: true, required: true, invalid: true })).toEqual({
			'aria-disabled': 'true',
			'aria-required': 'true',
			'aria-invalid': 'true',
		});
	});
});

describe('attrs', () => {
	it('space-joins truthy parts', () => {
		expect(attrs('foo', undefined, 'bar')).toBe('foo bar');
	});

	it('skips false and null', () => {
		expect(attrs(false, 'a', null, 'b')).toBe('a b');
	});

	it('returns undefined when nothing remains', () => {
		expect(attrs(undefined)).toBeUndefined();
		expect(attrs()).toBeUndefined();
		expect(attrs(false, null, undefined)).toBeUndefined();
	});
});
