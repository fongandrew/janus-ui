import '@testing-library/jest-dom/vitest';
import '~/shared/utility/vitest/custom-matchers';

import { vi } from 'vitest';

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

class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

window.ResizeObserver = ResizeObserver;
