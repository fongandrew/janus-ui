import {
	formatConjunctionParts,
	formatConjunctionStr,
	formatDisjunctionParts,
	formatDisjunctionStr,
} from '~/shared/utility/text/list';

describe('List formatting', () => {
	describe('formatConjunctionStr', () => {
		it('formats a list of parts', () => {
			expect(formatConjunctionStr(['a', 'b', 'c'], 'en-US')).toEqual('a, b, and c');
		});

		it('formats a list of parts with different locales', () => {
			expect(formatConjunctionStr(['a', 'b', 'c'], 'fr-FR')).toEqual('a, b et c');
		});
	});

	describe('formatConjunctionParts', () => {
		it('formats a list of parts', () => {
			expect(formatConjunctionParts([1, 2, 3], 'en-US')).toEqual([1, ', ', 2, ', and ', 3]);
		});
	});

	describe('formatDisjunctionStr', () => {
		it('formats a list of parts', () => {
			expect(formatDisjunctionStr(['a', 'b', 'c'], 'en-US')).toEqual('a, b, or c');
		});

		it('formats a list of parts with different locales', () => {
			expect(formatDisjunctionStr(['a', 'b', 'c'], 'fr-FR')).toEqual('a, b ou c');
		});
	});

	describe('formatDisjunctionParts', () => {
		it('formats a list of parts', () => {
			expect(formatDisjunctionParts([1, 2, 3], 'en-US')).toEqual([1, ', ', 2, ', or ', 3]);
		});
	});
});
