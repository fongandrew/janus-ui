/**
 * Calculate luminance of a color for contrast calculation
 */
function getLuminance(hex: string): number {
	const rgb = hexToRgb(hex);
	if (!rgb) return 0;

	const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1]!, 16),
				g: parseInt(result[2]!, 16),
				b: parseInt(result[3]!, 16),
			}
		: null;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
	const lum1 = getLuminance(color1);
	const lum2 = getLuminance(color2);
	const brightest = Math.max(lum1, lum2);
	const darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastingTextColor(backgroundColor: string): string {
	const whiteContrast = getContrastRatio(backgroundColor, '#ffffff');
	const blackContrast = getContrastRatio(backgroundColor, '#000000');

	// Return the color with better contrast (WCAG AA requires 4.5:1 for normal text)
	return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

/**
 * Validate if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
	return /^#[0-9A-F]{6}$/i.test(color);
}
