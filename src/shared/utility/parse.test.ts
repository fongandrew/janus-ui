import { parseFloatOrNull, parseIntOrNull } from '~/shared/utility/parse';

describe('parseIntOrNull', () => {
	it('should parse valid integer strings', () => {
		expect(parseIntOrNull('42')).toBe(42);
		expect(parseIntOrNull('0')).toBe(0);
		expect(parseIntOrNull('-123')).toBe(-123);
	});

	it('should handle strings with leading/trailing non-numeric characters', () => {
		expect(parseIntOrNull('42px')).toBe(42);
		expect(parseIntOrNull('  100  ')).toBe(100);
	});

	it('should return null for non-numeric strings', () => {
		expect(parseIntOrNull('abc')).toBeNull();
		expect(parseIntOrNull('.')).toBeNull();
		expect(parseIntOrNull('')).toBeNull();
	});

	it('should return null for null input', () => {
		expect(parseIntOrNull(null)).toBeNull();
	});

	it('should respect the provided radix', () => {
		expect(parseIntOrNull('10', 2)).toBe(2); // Binary: 10 = 2 in decimal
		expect(parseIntOrNull('FF', 16)).toBe(255); // Hex: FF = 255 in decimal
		expect(parseIntOrNull('100', 8)).toBe(64); // Octal: 100 = 64 in decimal
	});
});

describe('parseFloatOrNull', () => {
	it('should parse valid float strings', () => {
		expect(parseFloatOrNull('3.14')).toBe(3.14);
		expect(parseFloatOrNull('0.0')).toBe(0);
		expect(parseFloatOrNull('-2.5')).toBe(-2.5);
		expect(parseFloatOrNull('42')).toBe(42);
	});

	it('should handle scientific notation', () => {
		expect(parseFloatOrNull('1e3')).toBe(1000);
		expect(parseFloatOrNull('1.5e-2')).toBe(0.015);
	});

	it('should handle strings with leading/trailing non-numeric characters', () => {
		expect(parseFloatOrNull('3.14px')).toBe(3.14);
		expect(parseFloatOrNull('  2.5  ')).toBe(2.5);
	});

	it('should return null for non-numeric strings', () => {
		expect(parseFloatOrNull('abc')).toBeNull();
		expect(parseFloatOrNull('')).toBeNull();
	});

	it('should return null for null input', () => {
		expect(parseFloatOrNull(null)).toBeNull();
	});
});
