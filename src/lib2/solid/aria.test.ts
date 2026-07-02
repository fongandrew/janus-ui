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

	it('emits nothing when all flags are false/absent', () => {
		expect(ariaize({})).toEqual({});
	});
});

describe('attrs', () => {
	it('joins truthy parts with a space', () => {
		expect(attrs('foo', 'bar')).toBe('foo bar');
	});

	it('drops falsy parts', () => {
		expect(attrs('foo', false, null, undefined, 'bar')).toBe('foo bar');
	});

	it('returns undefined when nothing survives', () => {
		expect(attrs(undefined, false)).toBeUndefined();
	});
});
