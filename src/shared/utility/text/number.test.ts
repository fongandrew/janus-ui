import { formatCurrency, formatInteger, formatPercentage } from '~/shared/utility/text/number';

describe('Number formatting', () => {
	describe('formatInteger', () => {
		it('formats integers', () => {
			expect(formatInteger(1234567, 'en-US')).toEqual('1,234,567');
		});

		it('formats integers with different locales', () => {
			expect(formatInteger(1234567, 'fr-FR')).toEqual('1 234 567');
		});
	});

	describe('formatCurrency', () => {
		it('formats currency', () => {
			expect(formatCurrency(5.99, 'USD', 'en-US')).toEqual('$5.99');
		});

		it('formats currency with different locales', () => {
			expect(formatCurrency(5.99, 'USD', 'fr-FR')).toEqual('5,99 $US');
		});
	});

	describe('formatPercentage', () => {
		it('formats percentages', () => {
			expect(formatPercentage(0.07, 'en-US')).toEqual('7%');
		});

		it('formats percentages with different locales', () => {
			expect(formatPercentage(0.07, 'fr-FR')).toEqual('7 %');
		});
	});
});
