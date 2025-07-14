import { describe, expect, it } from 'vitest';

import { camelToKebab } from '~/lib/utility/camel-to-kebab';

describe('camelToKebab', () => {
	it('should convert camel case to kebab case', () => {
		expect(camelToKebab('camelCase')).toBe('camel-case');
		expect(camelToKebab('camelCaseString')).toBe('camel-case-string');
	});
});
