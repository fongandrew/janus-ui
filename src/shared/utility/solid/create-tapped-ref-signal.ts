import { createSignal } from 'solid-js';

/**
 * A Solid JS utility that, when given a callback function for a ref, returns a signal
 * and setter (that can be used as a ref itself)
 */
export function createTappedRefSignal<TRef>(callback: (value: TRef) => void) {
	const [signal, setSignal] = createSignal<TRef>();
	return [
		signal,
		(value: TRef) => {
			callback(value);
			// Appease TypeScript over setter accepting both functional and static forms
			setSignal(() => value);
		},
	] as const;
}
