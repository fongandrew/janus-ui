import { describe, expect, it } from 'vitest';

import { ariaize, attrs } from '~/lib2/solid/aria';

describe('ariaize', () => {
	it('maps disabled -> aria-disabled, never native disabled', () => {
		expect(ariaize({ disabled: true })).toEqual({ 'aria-disabled': true });
	});

	it('maps required -> aria-required', () => {
		expect(ariaize({ required: true })).toEqual({ 'aria-required': true });
	});

	it('maps invalid -> aria-invalid', () => {
		expect(ariaize({ invalid: true })).toEqual({ 'aria-invalid': true });
	});

	it('combines all three when set', () => {
		expect(ariaize({ disabled: true, required: true, invalid: true })).toEqual({
			'aria-disabled': true,
			'aria-required': true,
			'aria-invalid': true,
		});
	});

	it('omits keys for falsy / absent props rather than emitting false', () => {
		expect(ariaize({})).toEqual({});
		expect(ariaize({ disabled: false, required: false, invalid: false })).toEqual({});
	});
});

describe('attrs', () => {
	it('space-joins truthy string parts', () => {
		expect(attrs('foo', 'bar')).toBe('foo bar');
	});

	it('skips falsy / null / undefined parts', () => {
		expect(attrs('foo', false, null, undefined, 'bar')).toBe('foo bar');
	});

	it('returns undefined when nothing survives', () => {
		expect(attrs(undefined)).toBeUndefined();
		expect(attrs(false, null, undefined)).toBeUndefined();
	});
});
