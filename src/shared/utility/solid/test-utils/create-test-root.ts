import { createRoot } from 'solid-js';
import { afterEach } from 'vitest';

let disposeFns: (() => void)[] = [];

/**
 * After each test, dispose all created roots
 */
afterEach(() => {
	disposeFns.forEach((dispose) => dispose());
	disposeFns = [];
});

/**
 * Returns an auto-disposing root
 */
export function createTestRoot(fn: () => void) {
	let disposeFn: (() => void) | undefined;
	createRoot((dispose) => {
		disposeFns.push(dispose);
		disposeFn = () => {
			const index = disposeFns.indexOf(dispose);
			if (index !== -1) {
				dispose();
				disposeFns.splice(index, 1);
			}
		};
		fn();
	});
	return () => disposeFn?.();
}
