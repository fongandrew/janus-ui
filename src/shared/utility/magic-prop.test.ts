import { describe, expect, it } from 'vitest';

import { createMagicProp } from '~/shared/utility/magic-prop';

describe('createMagicProp', () => {
	it('should create an accessor/setter pair for regular objects', () => {
		const [getValue, setValue] = createMagicProp<string>();
		const obj = {};

		// Initial value should be undefined
		expect(getValue(obj)).toBeUndefined();

		// Setting and getting value
		setValue(obj, 'test value');
		expect(getValue(obj)).toBe('test value');

		// Overwriting existing value
		setValue(obj, 'new value');
		expect(getValue(obj)).toBe('new value');

		// Setting to undefined
		setValue(obj, undefined);
		expect(getValue(obj)).toBeUndefined();
	});

	it('should use Object.defineProperty when specified', () => {
		const [getValue, setValue] = createMagicProp<number>(true);
		const obj = {};

		setValue(obj, 42);
		expect(getValue(obj)).toBe(42);

		// Property should not be enumerable
		expect(Object.keys(obj)).toHaveLength(0);
	});

	it('should create unique property names for different instances', () => {
		const [getValue1, setValue1] = createMagicProp<string>();
		const [getValue2, setValue2] = createMagicProp<string>();
		const obj = {};

		setValue1(obj, 'first value');
		setValue2(obj, 'second value');

		expect(getValue1(obj)).toBe('first value');
		expect(getValue2(obj)).toBe('second value');

		// Each accessor should only access its own value
		setValue1(obj, 'updated first');
		expect(getValue1(obj)).toBe('updated first');
		expect(getValue2(obj)).toBe('second value');
	});

	it('should work with typed objects', () => {
		interface TestObject {
			existingProp: string;
		}

		const [getValue, setValue] = createMagicProp<boolean, TestObject>();
		const obj: TestObject = { existingProp: 'exists' };

		setValue(obj, true);
		expect(getValue(obj)).toBe(true);
		expect(obj.existingProp).toBe('exists');
	});
});
