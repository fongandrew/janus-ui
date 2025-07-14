import { describe, expect, it } from 'vitest';

import { normalizeText } from '~/lib/utility/normalize-text';

describe('normalizeText', () => {
	it('should normalize diacritics', () => {
		expect(normalizeText('café')).toBe('cafe');
	});

	it('should normalize smart quotes', () => {
		expect(normalizeText('‘single’ “double”')).toBe('\'single\' "double"');
	});

	it('should remove different kinds of dashes', () => {
		expect(normalizeText('a–b')).toBe('a b');
		expect(normalizeText('a—b')).toBe('a b');
	});

	it('should remove zero-width characters', () => {
		expect(normalizeText('zero​width')).toBe('zerowidth');
	});

	it('should normalize whitespace', () => {
		expect(normalizeText('  multiple   spaces  ')).toBe('multiple spaces');
	});

	it('should remove punctuation', () => {
		expect(normalizeText('hello, world!')).toBe('hello world');
	});

	it('should normalize ligatures', () => {
		expect(normalizeText('æœꜵꜷ')).toBe('aeoeaoau');
	});

	it('should handle empty strings', () => {
		expect(normalizeText('')).toBe('');
	});
});
