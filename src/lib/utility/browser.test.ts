import { afterEach, describe, expect, it } from 'vitest';

import { isSafari } from '~/lib/utility/browser';

describe('Browser utility functions', () => {
	const originalNavigator = global.navigator;

	afterEach(() => {
		// Restore the original navigator after each test
		Object.defineProperty(global, 'navigator', {
			value: originalNavigator,
			writable: true,
		});

		// Reset cache
		isSafari.cache.clear();
	});

	describe('isSafari', () => {
		it('should return true for Safari browser', () => {
			// Mock the navigator object with Safari user agent
			Object.defineProperty(global, 'navigator', {
				value: {
					userAgent:
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
				},
				writable: true,
			});

			expect(isSafari()).toBe(true);
		});

		it('should return false for Chrome browser', () => {
			// Mock the navigator object with Chrome user agent
			Object.defineProperty(global, 'navigator', {
				value: {
					userAgent:
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
				},
				writable: true,
			});

			expect(isSafari()).toBe(false);
		});

		it('should return false for Firefox browser', () => {
			// Mock the navigator object with Firefox user agent
			Object.defineProperty(global, 'navigator', {
				value: {
					userAgent:
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
				},
				writable: true,
			});

			expect(isSafari()).toBe(false);
		});
	});
});
