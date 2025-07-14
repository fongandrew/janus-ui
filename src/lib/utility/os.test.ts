import { afterEach, describe, expect, it } from 'vitest';

import { isMac } from '~/lib/utility/os';

describe('OS utility functions', () => {
	const originalNavigator = global.navigator;

	afterEach(() => {
		// Restore the original navigator after each test
		Object.defineProperty(global, 'navigator', {
			value: originalNavigator,
			writable: true,
		});

		// Reset cache
		isMac.cache.clear();
	});

	describe('isMac', () => {
		it('should return true for Mac OS user agents', () => {
			// Mock the navigator object with Mac user agent
			Object.defineProperty(global, 'navigator', {
				value: {
					userAgent:
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
				},
				writable: true,
			});

			expect(isMac()).toBe(true);
		});

		it('should return false for non-Mac user agents', () => {
			// Mock the navigator object with a Windows user agent
			Object.defineProperty(global, 'navigator', {
				value: {
					userAgent:
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
				},
				writable: true,
			});

			expect(isMac()).toBe(false);
		});
	});
});
