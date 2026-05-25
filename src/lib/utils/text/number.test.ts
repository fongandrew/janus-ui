import { describe, expect, it } from 'vitest';

import { formatCurrency, formatInteger, formatPercentage } from './number';

describe('Number formatting', () => {
	describe('formatInteger', () => {
		it('formats integers', () => {
			expect(formatInteger(1234567, 'en-US')).toEqual('1,234,567');
		});

		it('formats integers with different locales', () => {
			// French locale uses narrow no-break space ( ) as thousands separator
			expect(formatInteger(1234567, 'fr-FR')).toMatch(/^1[\s ]234[\s ]567$/);
		});
	});

	describe('formatCurrency', () => {
		it('formats currency', () => {
			expect(formatCurrency(5.99, 'USD', 'en-US')).toEqual('$5.99');
		});

		it('formats currency with different locales', () => {
			// French locale uses narrow no-break space ( ) as currency separator
			expect(formatCurrency(5.99, 'USD', 'fr-FR')).toMatch(/^5,99[\s ]\$US$/);
		});
	});

	describe('formatPercentage', () => {
		it('formats percentages', () => {
			expect(formatPercentage(0.07, 'en-US')).toEqual('7%');
		});

		it('formats percentages with different locales', () => {
			// French locale uses narrow no-break space ( ) before percent sign
			expect(formatPercentage(0.07, 'fr-FR')).toMatch(/^7[\s ]%$/);
		});
	});
});
