import '@testing-library/jest-dom/vitest';
import '~/shared/utility/test-utils/custom-matchers';

import { vi } from 'vitest';

// For SSR testing, make sure our callbacks index file gets loaded
if ((process.env as Record<string, string | undefined>)['TEST_MODE'] === 'ssr') {
	beforeAll(async () => {
		import('~/ssr-callbacks');
	});
}

window.HTMLElement.prototype.scrollIntoView = () => {};

process.env.TZ = 'UTC';

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

Object.defineProperty(window, 'requestIdleCallback', {
	writable: true,
	value: vi.fn().mockImplementation((callback) => {
		const start = Date.now();
		return setTimeout(() => {
			callback({
				didTimeout: false,
				timeRemaining: () => Math.max(0, 50.0 - (Date.now() - start)),
			});
		}, 1);
	}),
});

Object.defineProperty(window, 'cancelIdleCallback', {
	writable: true,
	value: vi.fn().mockImplementation((id) => {
		clearTimeout(id);
	}),
});

class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

window.ResizeObserver = ResizeObserver;
