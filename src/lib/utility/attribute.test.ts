import { describe, expect, it } from 'vitest';

import { attrIsTruthy, attrNoConflict, setAttrs } from '~/lib/utility/attribute';

describe('attrIsTruthy', () => {
	it('returns true for attribute with empty string value', () => {
		const element = document.createElement('div');
		element.setAttribute('data-test', '');
		expect(attrIsTruthy(element, 'data-test')).toBe(true);
	});

	it('returns true for attribute with any non-false string value', () => {
		const element = document.createElement('div');
		element.setAttribute('data-test', 'true');
		expect(attrIsTruthy(element, 'data-test')).toBe(true);

		element.setAttribute('data-test', 'hello');
		expect(attrIsTruthy(element, 'data-test')).toBe(true);
	});

	it('returns false for attribute with "false" string value', () => {
		const element = document.createElement('div');
		element.setAttribute('data-test', 'false');
		expect(attrIsTruthy(element, 'data-test')).toBe(false);
	});

	it('returns false for non-existent attribute', () => {
		const element = document.createElement('div');
		expect(attrIsTruthy(element, 'data-test')).toBe(false);
	});
});

describe('attrNoConflict', () => {
	it('returns first value when second value is null or undefined', () => {
		expect(attrNoConflict('value', null)).toBe('value');
		expect(attrNoConflict('value', undefined)).toBe('value');
	});

	it('returns second value when first value is null or undefined', () => {
		expect(attrNoConflict(null, 'value')).toBe('value');
		expect(attrNoConflict(undefined, 'value')).toBe('value');
	});

	it('returns the value when both values are the same', () => {
		expect(attrNoConflict('value', 'value')).toBe('value');
		expect(attrNoConflict(123, 123)).toBe(123);
	});

	it('returns null when both values are null', () => {
		expect(attrNoConflict(null, null)).toBe(null);
	});

	it('returns undefined when both values are undefined', () => {
		expect(attrNoConflict(undefined, undefined)).toBe(undefined);
	});

	it('returns null if one is null and the other is undefined', () => {
		expect(attrNoConflict(null, undefined)).toBe(null);
	});

	it('throws an error when different non-null values are provided', () => {
		expect(() => attrNoConflict('value1', 'value2')).toThrow(
			'Conflicting attributes: value1 and value2',
		);
		expect(() => attrNoConflict(123, 456)).toThrow('Conflicting attributes: 123 and 456');
	});

	it('works with different types using generics', () => {
		expect(attrNoConflict<number>(42, null)).toBe(42);
		expect(attrNoConflict<boolean>(true, undefined)).toBe(true);
		expect(() => attrNoConflict<boolean>(true, false)).toThrow(
			'Conflicting attributes: true and false',
		);
	});
});

describe('setAttrs', () => {
	it('sets string attributes correctly', () => {
		const element = document.createElement('div');
		setAttrs(element, {
			'data-test': 'value',
			'aria-label': 'Test label',
		});

		expect(element.getAttribute('data-test')).toBe('value');
		expect(element.getAttribute('aria-label')).toBe('Test label');
	});

	it('sets number attributes as strings', () => {
		const element = document.createElement('div');
		setAttrs(element, {
			'data-count': 42,
			tabindex: 0,
		});

		expect(element.getAttribute('data-count')).toBe('42');
		expect(element.getAttribute('tabindex')).toBe('0');
	});

	it('sets boolean attributes as strings', () => {
		const element = document.createElement('div');
		setAttrs(element, {
			'aria-expanded': true,
			disabled: false,
		});

		expect(element.getAttribute('aria-expanded')).toBe('true');
		expect(element.getAttribute('disabled')).toBe('false');
	});

	it('skips undefined values', () => {
		const element = document.createElement('div');
		element.setAttribute('data-test', 'original');

		setAttrs(element, {
			'data-test': undefined,
			'data-new': 'value',
		});

		expect(element.getAttribute('data-test')).toBe('original');
		expect(element.getAttribute('data-new')).toBe('value');
	});

	it('removes attributes when value is null', () => {
		const element = document.createElement('div');
		element.setAttribute('data-test', 'value');
		element.setAttribute('aria-label', 'label');

		setAttrs(element, {
			'data-test': null,
			'aria-label': 'new label',
		});

		expect(element.hasAttribute('data-test')).toBe(false);
		expect(element.getAttribute('aria-label')).toBe('new label');
	});

	it('returns the element for chaining', () => {
		const element = document.createElement('div');
		const result = setAttrs(element, { 'data-test': 'value' });

		expect(result).toBe(element);
	});
});
