import { describe, expect, it } from 'vitest';

import { ariaize, attrs } from './aria';

describe('ariaize', () => {
	it('converts disabled to aria-disabled', () => {
		expect(ariaize({ disabled: true })).toEqual({ 'aria-disabled': 'true' });
	});

	it('does not set aria-disabled when false', () => {
		expect(ariaize({ disabled: false })).toEqual({ 'aria-disabled': undefined });
	});

	it('passes through other props', () => {
		expect(ariaize({ id: 'test', class: 'btn' })).toEqual({ id: 'test', class: 'btn' });
	});
});

describe('attrs', () => {
	it('joins non-empty strings', () => {
		expect(attrs('foo', undefined, 'bar')).toBe('foo bar');
	});

	it('returns undefined for all empty', () => {
		expect(attrs(undefined, null, false)).toBeUndefined();
	});

	it('returns single value', () => {
		expect(attrs('only')).toBe('only');
	});
});
