import { attrIsTruthy, attrNoConflict } from '~/shared/utility/attribute';

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
