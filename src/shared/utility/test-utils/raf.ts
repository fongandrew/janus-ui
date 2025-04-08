import { vi } from 'vitest';

/**
 * Returns a requestAnimationFrame promise that plays nice with fake timers
 */
export function raf() {
	return new Promise((resolve) => {
		requestAnimationFrame(resolve);
		if (vi.isFakeTimers()) {
			vi.advanceTimersToNextFrame();
		}
	});
}
