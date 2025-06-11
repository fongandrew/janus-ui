import { describe, expect, it } from 'vitest';

import {
	getContrastingTextColor,
	getContrastRatio,
	isValidHexColor,
} from '~/shared/utility/color-contrast';

describe('color-contrast', () => {
	describe('getContrastRatio', () => {
		it('calculates contrast ratio between black and white', () => {
			const ratio = getContrastRatio('#000000', '#ffffff');
			expect(ratio).toBeCloseTo(21, 0); // Perfect contrast is 21:1
		});

		it('calculates contrast ratio for same colors', () => {
			const ratio = getContrastRatio('#ff0000', '#ff0000');
			expect(ratio).toBe(1); // Same color has 1:1 contrast
		});

		it('calculates contrast ratio for blue and white', () => {
			const ratio = getContrastRatio('#0000ff', '#ffffff');
			expect(ratio).toBeGreaterThan(8); // Should be high contrast
		});

		it('handles colors without # prefix', () => {
			const ratio = getContrastRatio('000000', 'ffffff');
			expect(ratio).toBeCloseTo(21, 0);
		});
	});

	describe('getContrastingTextColor', () => {
		it('returns white for dark backgrounds', () => {
			expect(getContrastingTextColor('#000000')).toBe('#ffffff');
			expect(getContrastingTextColor('#1a1a1a')).toBe('#ffffff');
			expect(getContrastingTextColor('#333333')).toBe('#ffffff');
		});

		it('returns black for light backgrounds', () => {
			expect(getContrastingTextColor('#ffffff')).toBe('#000000');
			expect(getContrastingTextColor('#f0f0f0')).toBe('#000000');
			expect(getContrastingTextColor('#eeeeee')).toBe('#000000');
		});

		it('handles medium colors appropriately', () => {
			// Test some colors that could go either way
			const result1 = getContrastingTextColor('#808080');
			expect(['#ffffff', '#000000']).toContain(result1);

			const result2 = getContrastingTextColor('#3b82f6'); // Blue
			expect(['#ffffff', '#000000']).toContain(result2);
		});

		it('handles colors without # prefix', () => {
			expect(getContrastingTextColor('000000')).toBe('#ffffff');
			expect(getContrastingTextColor('ffffff')).toBe('#000000');
		});

		it('handles invalid colors gracefully', () => {
			// Should not throw, might return a default
			const result = getContrastingTextColor('invalid');
			expect(['#ffffff', '#000000']).toContain(result);
		});
	});

	describe('isValidHexColor', () => {
		it('validates correct hex colors', () => {
			expect(isValidHexColor('#000000')).toBe(true);
			expect(isValidHexColor('#ffffff')).toBe(true);
			expect(isValidHexColor('#FFFFFF')).toBe(true);
			expect(isValidHexColor('#123456')).toBe(true);
			expect(isValidHexColor('#abcdef')).toBe(true);
			expect(isValidHexColor('#ABCDEF')).toBe(true);
		});

		it('rejects invalid hex colors', () => {
			expect(isValidHexColor('000000')).toBe(false); // Missing #
			expect(isValidHexColor('#00000')).toBe(false); // Too short
			expect(isValidHexColor('#0000000')).toBe(false); // Too long
			expect(isValidHexColor('#gggggg')).toBe(false); // Invalid characters
			expect(isValidHexColor('#12345g')).toBe(false); // Invalid character
			expect(isValidHexColor('')).toBe(false); // Empty string
			expect(isValidHexColor('#')).toBe(false); // Just hash
		});
	});
});
