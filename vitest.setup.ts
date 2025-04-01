import '@testing-library/jest-dom/vitest';
import '~/shared/utility/test-utils/custom-matchers';

import { vi } from 'vitest';

// Fake isServer for SSR tests. This doesn't actually make the tests run in SSR mode.
// We're still running tests as if they were in a browser environment (including the
// using the Solid client-side render) but setting `isServer` forces any of *our* Solid
// rendering code to go down SSR-specific paths. This is convenient if we want to test
// that SSR generated HTML + vanilla JS client code play nice without spinning up two
// different processes. See render-ssr.tsx.
vi.mock('solid-js/web', async (importActual) => {
	const actual = await (importActual() as any);
	return {
		...actual,
		isServer: (process.env as Record<string, string | undefined>)['TEST_MODE'] === 'ssr',
	};
});

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
