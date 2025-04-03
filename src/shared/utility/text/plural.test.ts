import { describe, expect, it } from 'vitest';

import { plural, type PluralRules } from '~/shared/utility/text/plural';

describe('plural', () => {
	const bookRules: PluralRules = {
		one: '# book',
		other: '# books',
	};

	const complexRules: PluralRules = {
		zero: 'no items',
		one: '# item',
		two: '# items (double)',
		few: '# items (few)',
		many: '# items (many)',
		other: '# items',
	};

	it('handles basic english pluralization', () => {
		expect(plural(1, bookRules)).toBe('1 book');
		expect(plural(2, bookRules)).toBe('2 books');
		expect(plural(0, bookRules)).toBe('0 books');
		expect(plural(5, bookRules)).toBe('5 books');
	});

	it('respects locale-specific rules', () => {
		// Arabic has complex pluralization rules. Apply formatNumber as well to force
		// English number formatting since I can't actually read Arabic.
		const result = plural(2, complexRules, { locale: 'ar', formatNumber: (n) => n.toString() });
		expect(result).toBe('2 items (double)');
	});

	it('uses custom number formatting', () => {
		const formatNumber = (n: number) => `[${n}]`;
		expect(plural(1, bookRules, { formatNumber })).toBe('[1] book');
	});

	it('supports custom placeholder', () => {
		expect(plural(5, { other: 'COUNT items' }, { placeholder: 'COUNT' })).toBe('5 items');
	});

	it('falls back to other when rule not found', () => {
		expect(plural(0, bookRules)).toBe('0 books');
	});
});
